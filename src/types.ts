export enum ChessStatus {
  EMPTY,
  BLACK,
  WHITE,
}

export interface PieceState {
  x: number
  y: number
  status: ChessStatus
  isMark: boolean
}

export enum BlockStatus {
  NULL = '',
  HEAD = 'snakehead',
  BODY = 'snakebody',
  FOOD = 'food',
}

export interface BlockState {
  x: number
  y: number
  status: BlockStatus
}

export enum keyCode {
  LEFT = 37,
  UP,
  RIGHT,
  DOWN,
  SPACE = 32,
}

export interface TileState {
  x: number
  y: number
  isBlack: boolean
}
