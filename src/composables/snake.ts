import type { EffectScope, Ref } from 'vue'
import type { BlockState } from '~/types'
import { BlockStatus, keyCode } from '~/types'

type GameStatus = 'play' | 'pause' | 'over'

interface GameState {
  status: GameStatus
  timer?: number
  currentKey: keyCode
  snakePosition: { x: number; y: number }[]
  foodPosition?: { x: number; y: number }
  board: BlockState[][]
}

let scope: EffectScope | undefined

export class GamePlay {
  state = ref({}) as Ref<GameState>

  constructor(public rows: number, public cols: number, public speed: number) {
    useEventListener(document, 'onkeydown', this.trigger)
  }

  get board() {
    return this.state.value.board
  }

  get currentKey() {
    return this.state.value.currentKey
  }

  get snakePosition() {
    return this.state.value.snakePosition
  }

  get foodPosition() {
    return this.state.value.foodPosition
  }

  reset(rows = this.rows, cols = this.cols, speed = this.speed) {
    scope?.stop()

    this.rows = rows
    this.cols = cols
    this.speed = speed

    this.state.value = {
      status: 'play',
      currentKey: keyCode.RIGHT,
      snakePosition: [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ],
      board: Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols },
          (_, x): BlockState => ({
            x,
            y,
            status: BlockStatus.NULL,
          }),
        ),
      ),
    }

    this.generateFood()

    scope = effectScope()

    scope.run(() => {
      watchEffect(() => {
        this.snakePosition.forEach(({ x, y }, i) => {
          if (i === 0)
            this.board[y][x].status = BlockStatus.HEAD
          else this.board[y][x].status = BlockStatus.BODY
        })
      })

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
    })
  }

  generateFood() {
    let x, y
    do {
      y = Math.floor(Math.random() * this.rows)
      x = Math.floor(Math.random() * this.cols)
    } while (this.board[y][x].status !== BlockStatus.NULL)
    this.board[y][x].status = BlockStatus.FOOD
    this.state.value.foodPosition = { x, y }
  }

  trigger(ev: KeyboardEvent) {
    // TODO use ev.key
    const eKey = ev.keyCode // 获取按键键码值
    // 如果按下的是方向键，并且不是当前方向，也不是反方向和暂停状态
    if (
      eKey >= keyCode.LEFT
      && eKey <= keyCode.RIGHT
      && eKey !== this.currentKey
      && !(
        (this.currentKey === 37 && eKey === 39)
        || (this.currentKey === 38 && eKey === 40)
        || (this.currentKey === 39 && eKey === 37)
        || (this.currentKey === 40 && eKey === 38)
      )
      && this.state.value.status !== 'pause'
    ) {
      this.state.value.currentKey = eKey // 设置当前方向按键键码值
    }
    else if (eKey === keyCode.SPACE) {
      if (this.state.value.status === 'pause')
        this.state.value.status = 'play'

      if (this.state.value.status === 'play')
        this.state.value.status = 'pause'
    }
  }

  move() {
    const { snakePosition } = this
    switch (this.currentKey) {
      case keyCode.LEFT:
        // 蛇头撞到边界
        if (snakePosition[0].x < 0) {
          this.gameOver()
          return
        }
        // 添加元素
        else {
          snakePosition.unshift({ x: snakePosition[0].x - 1, y: snakePosition[0].y })
        }
        break
      case keyCode.UP:
        if (snakePosition[0].y < 0) {
          this.gameOver()
          return
        }
        else {
          snakePosition.unshift({ x: snakePosition[0].x, y: snakePosition[0].y - 1 })
        }
        break
      case keyCode.RIGHT:
        if (snakePosition[0].x > this.cols - 1) {
          this.gameOver()
          return
        }
        else {
          snakePosition.unshift({ x: snakePosition[0].x + 1, y: snakePosition[0].y })
        }
        break
      case keyCode.DOWN:
        if (snakePosition[0].y > this.rows - 1) {
          this.gameOver()
          return
        }
        else {
          snakePosition.unshift({ x: snakePosition[0].x, y: snakePosition[0].y + 1 })
        }
        break
    }
    // 蛇头位置与食物重叠
    if (
      this.foodPosition
      && snakePosition[0].x === this.foodPosition.x
      && snakePosition[0].y === this.foodPosition.y
    )
      this.generateFood()
    else
      snakePosition.pop() // 删除蛇尾

    // 从蛇身的第四节开始判断是否撞到自己
    for (let i = 3; i < snakePosition.length; i++) {
      if (snakePosition[i].x === snakePosition[0].x && snakePosition[i].y === snakePosition[0].y) {
        this.gameOver() // 游戏结束
        return
      }
    }
  }

  gameOver() {
    alert('game over')
    window.clearInterval(this.state.value.timer)
    this.state.value.status = 'over'
  }
}
