import type { Ref } from 'vue'
import type { PieceState } from '~/types'

export const EMPTY_CHESS = 'none'
export const BLACK_CHESS = 'block'
export const WHITE_CHESS = 'white'

export type GameStatus = 'ready' | 'play' | 'won' | 'lost'

export type ChessColor = 'block' | 'white'

interface GameState {
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
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor() {
    this.reset()
  }

  get board() {
    return this.state.value.board
  }

  reset(playerFirst = true) {
    this.state.value = {
      status: 'ready',
      playerColor: playerFirst ? BLACK_CHESS : WHITE_CHESS,
      computerColor: playerFirst ? WHITE_CHESS : BLACK_CHESS,
      board: Array.from({ length: 15 }, (_, y) =>
        Array.from({ length: 15 },
          (_, x): PieceState => ({
            x,
            y,
            status: EMPTY_CHESS,
            isMark: false,
          }),
        ),
      ),
    }

    !playerFirst && this.compterTurn()

    this.gameStart()
  }

  gameStart() {
    this.state.value.status = 'play'
  }

  gameOver(status: GameStatus) {
    this.state.value.status = status
    if (status === 'lost') {
      setTimeout(() => {
        // eslint-disable-next-line no-alert
        alert('lost')
        this.reset()
      })
    }
  }

  dropPiece(x: number, y: number, color: ChessColor) {
    this.board[y][x].status = color
  }

  clearAllMark() {
    this.board.flat().forEach((item) => {
      item.isMark = false
    })
  }

  markPiece(x: number, y: number) {
    this.board[y][x].isMark = true
  }

  onClick(block: PieceState) {
    const { x, y, status } = block
    if (status !== EMPTY_CHESS)
      return
    this.dropPiece(x, y, this.state.value.playerColor)
    this.state.value.playerLastPosition = [x, y]
    this.isPlayerWon(x, y) && this.playerWin()
  }

  isPlayerWon(x: number, y: number) {
    let count = 1 // 连续棋子个数
    const playerColor = this.state.value.playerColor
    let m
    let n

    // “——”方向
    for (m = x - 1; m >= 0; m--) {
      if (this.board[y][m].status === playerColor)
        count++

      else
        break
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[y][m].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    // “｜”方向
    for (n = y - 1; n >= 0; n--) {
      if (this.board[n][x].status === playerColor)
        count++

      else
        break
    }
    for (n = y + 1; n < 15; n++) {
      if (this.board[n][x].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    // “\”方向
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[n][m].status === playerColor)
        count++

      else
        break
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[n][m].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    // “/”方向
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[n][m].status === playerColor)
        count++

      else
        break
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[n][m].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    this.compterTurn()
    return false
  }

  playerWin() {
    this.markWonPieces(true)
    this.gameOver('won')
  }

  // 计算机下棋
  compterTurn() {
    let maxX = 0
    let maxY = 0
    let maxWeight = 0
    let x
    let y
    let temp
    for (x = 14; x >= 0; x--) {
      for (y = 14; y >= 0; y--) {
        if (this.board[y][x].status !== EMPTY_CHESS)
          continue

        temp = this.calcWeight(x, y)
        if (temp > maxWeight) {
          maxWeight = temp
          maxX = x
          maxY = y
        }
      }
    }
    // const nonEmpty = this.board.flat().filter(item => item.status !== EMPTY_CHESS)
    // const maxWeight = Math.max(...nonEmpty.map(({ x, y }) => this.calcWeight(x, y)))
    // const { x: maxX, y: maxY } = nonEmpty.find(({ x, y }) => this.calcWeight(x, y) === maxWeight) ?? {}
    // const { x: maxX, y: maxY } = nonEmpty.find(({ x, y }) => this.calcWeight(x, y) === maxWeight) as PieceState
    this.dropPiece(maxX, maxY, this.state.value.computerColor)
    this.clearAllMark()
    this.markPiece(maxX, maxY)
    this.state.value.computerLastPosition = [maxX, maxY]
    // 计算机是否取胜
    if ((maxWeight >= 100000 && maxWeight < 250000) || maxWeight >= 500000) {
      this.markWonPieces(false)
      this.gameOver('lost')
    }
  }

  // 标记显示获胜棋子
  markWonPieces(isPlayerWon: boolean) {
    let count = 1 // 连续棋子个数
    const lineChess: number[][] = [] // 连续棋子位置
    let x
    let y
    let chessColor
    let m
    let n
    if (isPlayerWon) {
      chessColor = this.state.value.playerColor
      x = this.state.value.playerLastPosition![0]
      y = this.state.value.playerLastPosition![1]
    }
    else {
      chessColor = this.state.value.computerColor
      x = this.state.value.computerLastPosition![0]
      y = this.state.value.computerLastPosition![1]
    }

    // “——”方向
    lineChess[0] = [x, y]
    for (m = x - 1; m >= 0; m--) {
      if (this.board[y][m].status === chessColor) {
        lineChess[count] = [m, y]
        count++
      }
      else {
        break
      }
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[y][m].status === chessColor) {
        lineChess[count] = [m, y]
        count++
      }
      else {
        break
      }
    }
    if (count >= 5) {
      lineChess.forEach(([x, y]) => {
        this.markPiece(x, y)
      })
      return
    }
    else { count = 1 }

    // “｜”方向
    lineChess[0] = [x, y] // 定义第一个数组元素
    for (n = y - 1; n >= 0; n--) {
      if (this.board[n][x].status === chessColor) {
        lineChess[count] = [x, n]
        count++
      }
      else {
        break
      }
    }
    for (n = y + 1; n < 15; n++) {
      if (this.board[n][x].status === chessColor) {
        lineChess[count] = [x, n]
        count++
      }
      else {
        break
      }
    }
    if (count >= 5) {
      lineChess.forEach(([x, y]) => {
        this.markPiece(x, y)
      })
      return
    }
    else { count = 1 }

    // “\”方向
    lineChess[0] = [x, y]
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        break
      }
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        break
      }
    }
    if (count >= 5) {
      lineChess.forEach(([x, y]) => {
        this.markPiece(x, y)
      })
    }
    else { count = 1 }

    // “/”方向
    lineChess[0] = [x, y]
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        break
      }
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[n][m].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        break
      }
    }
    if (count >= 5) {
      lineChess.forEach(([x, y]) => {
        this.markPiece(x, y)
      })
    }
    else { count = 1 }
  }

  /**
   * 统计X方向连子个数并判断两端是否为空
   */
  countAndSideX(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    // let n
    let count = 1
    let side1 = false
    let side2 = false
    for (m = x - 1; m >= 0; m--) {
      if (this.board[y][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[y][m].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[y][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[y][m].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  /**
   * 统计Y方向连子个数并判断两端是否为空
   */
  countAndSideY(x: number, y: number, chessColor: ChessColor): PointInfo {
    // let m
    let n
    let count = 1
    let side1 = false
    let side2 = false
    for (n = y - 1; n >= 0; n--) {
      if (this.board[n][x].status === chessColor) {
        count++
      }
      else {
        if (this.board[n][x].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (n = y + 1; n < 15; n++) {
      if (this.board[n][x].status === chessColor) {
        count++
      }
      else {
        if (this.board[n][x].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
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
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[n][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[n][m].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[n][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[n][m].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
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
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[n][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[n][m].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[n][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[n][m].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  /**
   * 计算下子权重
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
