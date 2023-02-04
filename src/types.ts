export type ChessStatus = 'none' | 'black' | 'white'

export interface PieceState {
  x: number
  y: number
  status: ChessStatus
  isMark: boolean
}
