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
    this.board[x][y].status = color
  }

  clearAllMark() {
    this.board.flat().forEach((item) => {
      item.isMark = false
    })
  }

  markPiece(x: number, y: number) {
    this.board[x][y].isMark = true
  }

  onClick(block: PieceState) {
    const { x, y } = block
    this.dropPiece(x, y, this.state.value.playerColor)
    this.state.value.playerLastPosition = [x, y]
    this.isPlayerWon(x, y) && this.playerWin()
  }

  isPlayerWon(x: number, y: number) {
    let count = 1 // 连续棋子个数
    const playerColor = this.state.value.playerColor
    let m
    let n
    // x方向
    for (m = y - 1; m >= 0; m--) {
      if (this.board[x][m].status === playerColor)
        count++

      else
        break
    }
    for (m = y + 1; m < 15; m++) {
      if (this.board[x][m].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    // y方向
    for (m = x - 1; m >= 0; m--) {
      if (this.board[m][y].status === playerColor)
        count++

      else
        break
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[m][y].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    // 左斜方向
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[m][n].status === playerColor)
        count++

      else
        break
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[m][n].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

    else
      count = 1

    // 右斜方向
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[m][n].status === playerColor)
        count++

      else
        break
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[m][n].status === playerColor)
        count++

      else
        break
    }
    if (count >= 5)
      return true

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
    let tem
    for (x = 14; x >= 0; x--) {
      for (y = 14; y >= 0; y--) {
        if (this.board[x][y].status !== EMPTY_CHESS)
          continue

        tem = this.calcWeight(x, y)
        if (tem > maxWeight) {
          maxWeight = tem
          maxX = x
          maxY = y
        }
      }
    }
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

    // x方向
    lineChess[0] = [x, y] // 定义第一个数组元素
    for (m = y - 1; m >= 0; m--) {
      if (this.board[x][m].status === chessColor) {
        lineChess[count] = [x, m]
        count++
      }
      else {
        break
      }
    }
    for (m = y + 1; m < 15; m++) {
      if (this.board[x][m].status === chessColor) {
        lineChess[count] = [x, m]
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
    // y方向
    count = 1
    lineChess[0] = [x, y]
    for (m = x - 1; m >= 0; m--) {
      if (this.board[m][y].status === chessColor) {
        lineChess[count] = [m, y]
        count++
      }
      else {
        break
      }
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[m][y].status === chessColor) {
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
    // 左斜方向
    count = 1
    lineChess[0] = [x, y]
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[m][n].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        break
      }
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[m][n].status === chessColor) {
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
      return
    }
    // 右斜方向
    count = 1
    lineChess[0] = [x, y]
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[m][n].status === chessColor) {
        lineChess[count] = [m, n]
        count++
      }
      else {
        break
      }
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[m][n].status === chessColor) {
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
  }

  // 统计X方向连子个数并判断两端是否为空
  countAndSideX(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    // let n
    let count = 1
    let side1 = false
    let side2 = false
    for (m = y - 1; m >= 0; m--) {
      if (this.board[x][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[x][m].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = y + 1; m < 15; m++) {
      if (this.board[x][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[x][m].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 统计Y方向连子个数并判断两端是否为空
  countAndSideY(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    // let n
    let count = 1
    let side1 = false
    let side2 = false
    for (m = x - 1; m >= 0; m--) {
      if (this.board[m][y].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][y].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[m][y].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][y].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 统计左斜方向连子个数并判断两端是否为空
  countAndSideXY(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    let n
    let count = 1
    let side1 = false
    let side2 = false
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[m][n].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][n].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[m][n].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][n].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 统计右斜方向连子个数并判断两端是否为空
  countAndSideYX(x: number, y: number, chessColor: ChessColor): PointInfo {
    let m
    let n
    let count = 1
    let side1 = false
    let side2 = false
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[m][n].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][n].status === EMPTY_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[m][n].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][n].status === EMPTY_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 计算下子权重
  calcWeight(x: number, y: number) {
    let weight = 14 - (Math.abs(x - 7) + Math.abs(y - 7)) // 基于棋盘位置权重
    let pointInfo = {} as PointInfo // 存储连子个数及两端是否为空的信息
    const playerColor = this.state.value.playerColor
    const computerColor = this.state.value.computerColor
    // x方向
    pointInfo = this.countAndSideX(x, y, computerColor)
    // 计算机下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    )
    pointInfo = this.countAndSideX(x, y, playerColor)
    // 玩家下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    )
    // y方向
    pointInfo = this.countAndSideY(x, y, computerColor)
    // 计算机下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    )
    pointInfo = this.countAndSideY(x, y, playerColor)
    // 玩家下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    )
    // 左斜方向
    pointInfo = this.countAndSideXY(x, y, computerColor)
    // 计算机下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    )
    pointInfo = this.countAndSideXY(x, y, playerColor)
    // 玩家下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    )
    // 右斜方向
    pointInfo = this.countAndSideYX(x, y, computerColor)
    // 计算机下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    )
    pointInfo = this.countAndSideYX(x, y, playerColor)
    // 玩家下子权重
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    )
    return weight
  }

  // 判断权重
  judgeWeight(count: number, side1: boolean, side2: boolean, isCom: boolean) {
    let weight = 0
    switch (count) {
      case 1:
        if (side1 && side2)
          weight = isCom ? 15 : 10 // 一个子两边为空

        break
      case 2:
        if (side1 && side2)
          weight = isCom ? 100 : 50 // 两个连子两边为空

        else if (side1 || side2)
          weight = isCom ? 10 : 5 // 两个连子一边为空

        break
      case 3:
        if (side1 && side2)
          weight = isCom ? 500 : 200 // 三个连子两边为空

        else if (side1 || side2)
          weight = isCom ? 30 : 20 // 三个连子一边为空

        break
      case 4:
        if (side1 && side2)
          weight = isCom ? 5000 : 2000 // 四个连子两边为空

        else if (side1 || side2)
          weight = isCom ? 400 : 100 // 四个连子一边为空

        break
      case 5:
        weight = isCom ? 100000 : 10000
        break
      default:
        weight = isCom ? 500000 : 250000
        break
    }
    return weight
  }
}
