export interface BlockState {
  x: number
  y: number
  revealed: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

type ChessStatus = 'none' | 'block' | 'white'

export interface PieceState {
  x: number
  y: number
  status: ChessStatus
  hoverClass: string
  isMark: boolean
}
