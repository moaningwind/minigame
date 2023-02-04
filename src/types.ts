export type ChessStatus = 'none' | 'block' | 'white'

export interface PieceState {
  x: number
  y: number
  status: ChessStatus
  isMark: boolean
}
