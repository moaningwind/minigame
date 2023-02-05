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
