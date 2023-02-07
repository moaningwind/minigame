import type { TileState } from '~/types'

type GameStatus = 'ready' | 'play'

interface GameState {
  status: GameStatus
  timer?: number
  top: number
  board: TileState[][]
}

export class GamePlay {
  state = ref<GameState>({
    status: 'ready',
    top: -500,
    board: [],
  })

  constructor() {
    watchEffect(() => {
      if (this.state.value.status === 'play') {
        this.state.value.timer = window.setInterval(() => {
          this.move()
        }, 16)
      }
      else {
        window.clearInterval(this.state.value.timer)
      }
    })
  }

  get board() {
    return this.state.value.board
  }

  reset() {
    this.state.value = {
      status: 'play',
      top: -500,
      board: Array.from({ length: 5 },
        (_, y) => {
          const random = Math.floor(Math.random() * 4)
          return Array.from({ length: 4 },
            (_, x): TileState => ({
              x,
              y,
              isBlack: x === random,
            }),
          )
        }),
    }
  }

  onClick(block: TileState) {
    if (!block.isBlack)
      return this.gameOver()
    block.isBlack = false
  }

  move() {
    if (3 + this.state.value.top > 0)
      this.state.value.top = 0

    else
      this.state.value.top += 3

    if (this.state.value.top === 0) {
      const random = Math.floor(Math.random() * 4)
      const lastRow = this.board.pop()!
      if (lastRow.every(({ isBlack }) => isBlack === false)) {
        this.board.unshift(lastRow.map(({ x, y }, i) => ({ x, y, isBlack: i === random })))
        this.state.value.top = -100
      }
      else {
        this.gameOver()
      }
    }
  }

  gameOver() {
    this.state.value = {
      status: 'ready',
      top: -500,
      board: [],
    }
    alert('game over')
  }
}
