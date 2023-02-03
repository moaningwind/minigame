import type { Ref } from 'vue'
import type { PieceState } from '~/types'

export const Empty_CHESS = 'none'
export const BLACK_CHESS = 'block'
export const WHITE_CHESS = 'white'

type GameStatus = 'ready' | 'play' | 'won' | 'lost'

type ChessColor = 'block' | 'white'

interface GameState {
  board: PieceState[][]
  status: GameStatus
  playerColor: ChessColor
  computerColor: ChessColor
  playerLastChess: number[] // 玩家最后落子位置
  computerLastChess: number[] // 计算机最后下子位置
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
      playerLastChess: [],
      computerLastChess: [],
      playerColor: playerFirst ? BLACK_CHESS : WHITE_CHESS,
      computerColor: playerFirst ? WHITE_CHESS : BLACK_CHESS,
      board: Array.from({ length: 15 }, (_, y) =>
        Array.from({ length: 15 },
          (_, x): PieceState => ({
            x,
            y,
            status: Empty_CHESS,
            hoverClass: '',
            isMark: false,
          }),
        ),
      ),
    }

    !playerFirst && this.comTurn() // 计算机下棋
  }

  // 游戏开始
  gameStart() {
    this.state.value.status = 'play'
  }

  // 游戏结束
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

  onClick(block: PieceState) {
    block.status = this.state.value.playerColor
    block.hoverClass = ''
    this.state.value.playerLastChess = [block.x, block.y]
    this.isPlayerWin(block.x, block.y)
  }

  // 玩家获胜
  playerWin() {
    this.markWinChesses(true) // 标记显示获胜棋子
    this.gameOver('won') // 游戏结束
  }

  // 玩家是否取胜
  isPlayerWin(x: number, y: number) {
    let count = 1 // 连续棋子个数
    const chessColor = this.state.value.playerColor
    let m
    let n
    // x方向
    for (m = y - 1; m >= 0; m--) {
      if (this.board[x][m].status === chessColor)
        count++

      else
        break
    }
    for (m = y + 1; m < 15; m++) {
      if (this.board[x][m].status === chessColor)
        count++

      else
        break
    }
    if (count >= 5) {
      this.playerWin() // 玩家胜利
      return
    }
    else {
      count = 1
    }
    // y方向
    for (m = x - 1; m >= 0; m--) {
      if (this.board[m][y].status === chessColor)
        count++

      else
        break
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[m][y].status === chessColor)
        count++

      else
        break
    }
    if (count >= 5) {
      this.playerWin() // 玩家胜利
      return
    }
    else {
      count = 1
    }
    // 左斜方向
    for (m = x - 1, n = y - 1; m >= 0 && n >= 0; m--, n--) {
      if (this.board[m][n].status === chessColor)
        count++

      else
        break
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[m][n].status === chessColor)
        count++

      else
        break
    }
    if (count >= 5) {
      this.playerWin() // 玩家胜利
      return
    }
    else {
      count = 1
    }
    // 右斜方向
    for (m = x - 1, n = y + 1; m >= 0 && n < 15; m--, n++) {
      if (this.board[m][n].status === chessColor)
        count++

      else
        break
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[m][n].status === chessColor)
        count++

      else
        break
    }
    if (count >= 5) {
      this.playerWin() // 玩家胜利
      return
    }

    this.comTurn() // 计算机下棋
  }

  // 计算机下棋
  comTurn() {
    let maxX = 0
    let maxY = 0
    let maxWeight = 0
    let x
    let y
    let tem
    for (x = 14; x >= 0; x--) {
      for (y = 14; y >= 0; y--) {
        if (this.board[x][y].status !== Empty_CHESS)
          // 如果该位置有棋子
          continue

        tem = this.comWeight(x, y)
        if (tem > maxWeight) {
          maxWeight = tem
          maxX = x
          maxY = y
        }
      }
    }
    this.board[maxX][maxY].status = this.state.value.computerColor // 计算机下棋
    this.board.flat().forEach((item) => {
      item.isMark = false
    })
    this.board[maxX][maxY].isMark = true // 计算机下棋
    this.state.value.computerLastChess = [maxX, maxY]
    // 计算机是否取胜
    if ((maxWeight >= 100000 && maxWeight < 250000) || maxWeight >= 500000) {
      this.markWinChesses(false) // 标记显示获胜棋子
      this.gameOver('lost') // 游戏结束
    }
  }

  // 标记显示获胜棋子
  markWinChesses(isPlayerWin: boolean) {
    let count = 1 // 连续棋子个数
    const lineChess: number[][] = [] // 连续棋子位置
    let x
    let y
    let chessColor
    let m
    let n
    if (isPlayerWin) {
      chessColor = this.state.value.playerColor
      x = this.state.value.playerLastChess[0]
      y = this.state.value.playerLastChess[1]
    }
    else {
      chessColor = this.state.value.computerColor
      x = this.state.value.computerLastChess[0]
      y = this.state.value.computerLastChess[1]
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
      this.markChess(lineChess)
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
      this.markChess(lineChess)
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
      this.markChess(lineChess)
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
    if (count >= 5)
      this.markChess(lineChess)
  }

  markChess(lineChess: number[][]) {
    lineChess.forEach(([x, y]) => {
      this.board[x][y].isMark = true
    })
  }

  // 统计X方向连子个数并判断两端是否为空
  numAndSideX(x: number, y: number, chessColor: ChessColor) {
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
        if (this.board[x][m].status === Empty_CHESS)
          side1 = true

        break
      }
    }
    for (m = y + 1; m < 15; m++) {
      if (this.board[x][m].status === chessColor) {
        count++
      }
      else {
        if (this.board[x][m].status === Empty_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 统计Y方向连子个数并判断两端是否为空
  numAndSideY(x: number, y: number, chessColor: ChessColor) {
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
        if (this.board[m][y].status === Empty_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1; m < 15; m++) {
      if (this.board[m][y].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][y].status === Empty_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 统计左斜方向连子个数并判断两端是否为空
  numAndSideXY(x: number, y: number, chessColor: ChessColor) {
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
        if (this.board[m][n].status === Empty_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y + 1; m < 15 && n < 15; m++, n++) {
      if (this.board[m][n].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][n].status === Empty_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 统计右斜方向连子个数并判断两端是否为空
  numAndSideYX(x: number, y: number, chessColor: ChessColor) {
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
        if (this.board[m][n].status === Empty_CHESS)
          side1 = true

        break
      }
    }
    for (m = x + 1, n = y - 1; m < 15 && n >= 0; m++, n--) {
      if (this.board[m][n].status === chessColor) {
        count++
      }
      else {
        if (this.board[m][n].status === Empty_CHESS)
          side2 = true

        break
      }
    }
    return { count, side1, side2 }
  }

  // 计算下子权重
  comWeight(x: number, y: number) {
    let weight = 14 - (Math.abs(x - 7) + Math.abs(y - 7)) // 基于棋盘位置权重
    let pointInfo = {} as PointInfo // 存储连子个数及两端是否为空的信息
    const playerColor = this.state.value.playerColor
    const computerColor = this.state.value.computerColor
    // x方向
    pointInfo = this.numAndSideX(x, y, computerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    ) // 计算机下子权重
    pointInfo = this.numAndSideX(x, y, playerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    ) // 玩家下子权重
    // y方向
    pointInfo = this.numAndSideY(x, y, computerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    ) // 计算机下子权重
    pointInfo = this.numAndSideY(x, y, playerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    ) // 玩家下子权重
    // 左斜方向
    pointInfo = this.numAndSideXY(x, y, computerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    ) // 计算机下子权重
    pointInfo = this.numAndSideXY(x, y, playerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    ) // 玩家下子权重
    // 右斜方向
    pointInfo = this.numAndSideYX(x, y, computerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      true,
    ) // 计算机下子权重
    pointInfo = this.numAndSideYX(x, y, playerColor)
    weight += this.judgeWeight(
      pointInfo.count,
      pointInfo.side1,
      pointInfo.side2,
      false,
    ) // 玩家下子权重
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
