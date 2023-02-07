import type { Ref } from 'vue'
import type { TileState } from '~/types'

type GameStatus = 'ready' | 'play' | 'pause' | 'over'

interface GameState {
  status: GameStatus
  timer?: number
  top: number
  board: TileState[][]
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(public rows: number, public cols: number, public speed: number) {
    this.state.value = {
      status: 'ready',
      top: -(100 * rows),
      board: [],
    }
  }

  get board() {
    return this.state.value.board
  }

  get top() {
    return this.state.value.top
  }

  reset(rows = this.rows, cols = this.cols, speed = this.speed) {
    this.rows = rows
    this.cols = cols
    this.speed = speed

    this.state.value = {
      status: 'play',
      top: -(100 * rows),
      board: Array.from({ length: rows },
        (_, y) => {
          const random = Math.floor(Math.random() * cols)
          return Array.from({ length: cols },
            (_, x): TileState => ({
              x,
              y,
              isBlack: x === random,
            }),
          )
        }),
    }

    watchEffect(() => {
      if (this.state.value.status === 'play') {
        this.state.value.timer = window.setInterval(() => {
          this.move()
        }, this.speed)
      }
      else {
        window.clearInterval(this.state.value.timer)
      }
    })
  }

  onClick(block: TileState) {
    if (!block.isBlack)
      return this.gameOver()
    block.isBlack = false
  }

  move() {
    if (3 + this.top > 0)
      this.state.value.top = 0

    else
      this.state.value.top += 3

    if (this.top === 0) {
      const random = Math.floor(Math.random() * this.cols)
      this.board.unshift(this.board.pop()!.map(({ x, y }, i) => ({ x, y, isBlack: i === random })))
      this.state.value.top = -100
    }
  }

  gameOver() {

  }
}
