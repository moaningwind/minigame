import type { Ref } from 'vue'
import type { PieceState } from '~/types'
import { ChessStatus } from '~/types'

type GameStatus = 'play' | 'won' | 'lost'

type ChessColor = ChessStatus.BLACK | ChessStatus.WHITE

interface GameState {
  manMachine: boolean
  blackTurn?: boolean
  status: GameStatus
  playerColor: ChessColor
  computerColor: ChessColor
  playerLastPosition?: [number, number]
  computerLastPosition?: [number, number]
  board: PieceState[][]
}

interface PointInfo {
  count: number
  side1: boolean
  side2: boolean
  lineChess: [number, number][]
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor() {
    this.reset()
  }

  get board() {
    return this.state.value.board
  }

  get playerColor() {
    return this.state.value.playerColor
  }

  get computerColor() {
    return this.state.value.computerColor
  }

  get playerLastPosition() {
    return this.state.value.playerLastPosition
  }

  get computerLastPosition() {
    return this.state.value.computerLastPosition
  }

  reset(playerFirst = true, manMachine = true) {
    this.state.value = {
      manMachine,
      status: 'play',
      playerColor: playerFirst ? ChessStatus.BLACK : ChessStatus.WHITE,
      computerColor: playerFirst ? ChessStatus.WHITE : ChessStatus.BLACK,
      board: Array.from({ length: 15 }, (_, y) =>
        Array.from({ length: 15 },
          (_, x): PieceState => ({
            x,
            y,
            status: ChessStatus.EMPTY,
            isMark: false,
          }),
        ),
      ),
    }

    if (manMachine)
      !playerFirst && this.compterTurn()
    else this.state.value.blackTurn = true
  }

  gameOver(status: Exclude<GameStatus, 'play'>) {
    const isPlayerWon = status === 'won'
    const x = isPlayerWon ? this.playerLastPosition![0] : this.computerLastPosition![0]
    const y = isPlayerWon ? this.playerLastPosition![1] : this.computerLastPosition![1]
    const chessColor = isPlayerWon ? this.playerColor : this.computerColor
    this.markWonPieces(x, y, chessColor)
    this.state.value.status = status
    if (status === 'lost') {
      setTimeout(() => {
        alert('lost')
      })
    }
  }

  /**
   * 落子
   */
  dropPiece(x: number, y: number, color: ChessColor) {
    this.board[y][x].status = color
  }

  clearAllMark() {
    this.board.flat().forEach((item) => {
      item.isMark = false
    })
  }

  /**
   * 标记棋子
   */
  markPiece(x: number, y: number) {
    this.board[y][x].isMark = true
  }

  isGameOver(x: number, y: number, chessColor: ChessColor) {
    return this.countAndSideX(x, y, chessColor).count >= 5
    || this.countAndSideY(x, y, chessColor).count >= 5
    || this.countAndSideYX(x, y, chessColor).count >= 5
    || this.countAndSideXY(x, y, chessColor).count >= 5
  }

  onClick(block: PieceState) {
    const { x, y, status } = block
    if (status !== ChessStatus.EMPTY)
      return

    const chessColor = this.state.value.blackTurn ? ChessStatus.BLACK : ChessStatus.WHITE
    this.state.value.blackTurn = !this.state.value.blackTurn

    this.dropPiece(x, y, chessColor)

    this.clearAllMark()
    this.markPiece(x, y)

    if (this.isGameOver(x, y, chessColor)) {
      this.markWonPieces(x, y, chessColor)
      setTimeout(() => {
        alert(`${chessColor} won`)
      })
    }
  }

  /**
   * 玩家回合
   */
  playerTurn(block: PieceState) {
    const { x, y, status } = block
    if (status !== ChessStatus.EMPTY)
      return

    this.dropPiece(x, y, this.playerColor)
    this.state.value.playerLastPosition = [x, y]

    if (this.isGameOver(x, y, this.playerColor))
      return this.gameOver('won')

    this.compterTurn()
  }

  /**
   * 计算机回合
   */
  compterTurn() {
    const nonEmptyBoard = this.board
      .flat()
      .filter(item => item.status === ChessStatus.EMPTY)
      .map(({ x, y }) => ({ x, y, weight: this.calcWeight(x, y) }))
    const maxWeight = Math.max(...nonEmptyBoard.map(({ weight }) => weight))
    const { x, y } = nonEmptyBoard.find(({ weight }) => weight === maxWeight)!

    this.dropPiece(x, y, this.computerColor)
    this.state.value.computerLastPosition = [x, y]

    this.clearAllMark()
    this.markPiece(x, y)

    // const isComputerWon = (maxWeight >= 100000 && maxWeight < 250000) || maxWeight >= 500000
    const isComputerWon = this.isGameOver(x, y, this.computerColor)
    if (isComputerWon)
      this.gameOver('lost')
  }

  // 标记显示获胜棋子
  markWonPieces(x: number, y: number, chessColor: ChessColor) {
    const pointInfoList: PointInfo[] = [
      this.countAndSideX(x, y, chessColor),
      this.countAndSideY(x, y, chessColor),
      this.countAndSideYX(x, y, chessColor),
      this.countAndSideXY(x, y, chessColor),
    ]

    pointInfoList.forEach((pointInfo) => {
      if (pointInfo.count >= 5)
        pointInfo.lineChess.forEach(([x, y]) => this.markPiece(x, y))
    })
  }

  /**
   * 统计“——”方向连子个数并判断两端是否为空
   */
  countAndSideX(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    // let n
    let count = 1
    let side1 = false
    let side2 = false
    const lineChess: [number, number][] = []
    for (m = x - 1; m >= 0; m--) {
      if (this.board[y][m].status === chessColor) {
        lineChess[count] = [m, y]
        count++
      }
      else {
        if (this.board[y][m].status === ChessStatus.EMPTY)
          side1 = true

        break
      }
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[y][m].status === chessColor) {
        lineChess[count] = [m, y]
        count++
      }
      else {
        if (this.board[y][m].status === ChessStatus.EMPTY)
          side2 = true

        break
      }
    }
    return { count, side1, side2, lineChess }
  }

  /**
   * 统计“｜”方向连子个数并判断两端是否为空
   */
  countAndSideY(x: number, y: number, chessColor: ChessColor): PointInfo {
    // let m
    let n
    let count = 1
    let side1 = false
    let side2 = false
    const lineChess: [number, number][] = []
    for (n = y - 1; n >= 0; n--) {
      if (this.board[n][x].status === chessColor) {
        lineChess[count] = [x, n]
        count++
      }
      else {
        if (this.board[n][x].status === ChessStatus.EMPTY)
          side1 = true

        break
      }
    }
    for (n = y + 1; n < 15; n++) {
      if (this.board[n][x].status === chessColor) {
        lineChess[count] = [x, n]
        count++
      }
      else {
        if (this.board[n][x].status === ChessStatus.EMPTY)
          side2 = true

        break
      }
    }
    return { count, side1, side2, lineChess }
  }

  /**
   * 统计“/”方向连子个数并判断两端是否为空
   */
  countAndSideXY(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    let n
    let count = 1
    let side1 = false
    let side2 = false
    const lineChess: [number, number][] = []
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        if (this.board[n][m].status === ChessStatus.EMPTY)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        if (this.board[n][m].status === ChessStatus.EMPTY)
          side2 = true

        break
      }
    }
    return { count, side1, side2, lineChess }
  }

  /**
   * 统计“\”方向连子个数并判断两端是否为空
   */
  countAndSideYX(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    let n
    let count = 1
    let side1 = false
    let side2 = false
    const lineChess: [number, number][] = []
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        if (this.board[n][m].status === ChessStatus.EMPTY)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        if (this.board[n][m].status === ChessStatus.EMPTY)
          side2 = true

        break
      }
    }
    return { count, side1, side2, lineChess }
  }

  /**
   * 计算落子权重
   */
  calcWeight(x: number, y: number) {
    let weight = 14 - (Math.abs(x - 7) + Math.abs(y - 7)) // 基于棋盘位置权重
    let pointInfo = {} as PointInfo
    const playerColor = this.state.value.playerColor
    const computerColor = this.state.value.computerColor

    pointInfo = this.countAndSideX(x, y, computerColor)
    weight += this.judgeWeight(pointInfo, true)
    pointInfo = this.countAndSideX(x, y, playerColor)
    weight += this.judgeWeight(pointInfo, false)

    pointInfo = this.countAndSideY(x, y, computerColor)
    weight += this.judgeWeight(pointInfo, true)
    pointInfo = this.countAndSideY(x, y, playerColor)
    weight += this.judgeWeight(pointInfo, false)

    pointInfo = this.countAndSideXY(x, y, computerColor)
    weight += this.judgeWeight(pointInfo, true)
    pointInfo = this.countAndSideXY(x, y, playerColor)
    weight += this.judgeWeight(pointInfo, false)

    pointInfo = this.countAndSideYX(x, y, computerColor)
    weight += this.judgeWeight(pointInfo, true)
    pointInfo = this.countAndSideYX(x, y, playerColor)
    weight += this.judgeWeight(pointInfo, false)

    return weight
  }

  /**
   * 判断权重
   */
  judgeWeight(pointInfo: PointInfo, isComputer: boolean) {
    const { count, side1, side2 } = pointInfo
    let weight = 0
    switch (count) {
      case 1:
        if (side1 && side2)
          weight = isComputer ? 15 : 10 // 一个子两边为空

        break
      case 2:
        if (side1 && side2)
          weight = isComputer ? 100 : 50 // 两个连子两边为空

        else if (side1 || side2)
          weight = isComputer ? 10 : 5 // 两个连子一边为空

        break
      case 3:
        if (side1 && side2)
          weight = isComputer ? 500 : 200 // 三个连子两边为空

        else if (side1 || side2)
          weight = isComputer ? 30 : 20 // 三个连子一边为空

        break
      case 4:
        if (side1 && side2)
          weight = isComputer ? 5000 : 2000 // 四个连子两边为空

        else if (side1 || side2)
          weight = isComputer ? 400 : 100 // 四个连子一边为空

        break
      case 5:
        weight = isComputer ? 100000 : 10000
        break
      default:
        weight = isComputer ? 500000 : 250000
        break
    }
    return weight
  }
}
