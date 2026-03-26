import { Move } from './move.js'
import { Game } from './game.js'

export class State {
  public static readonly UNDO_SYMBOL = '↶'
  public static readonly HINT_SYMBOL = 'ⓘ'

  private readonly game = new Game()
  private currentNumbers: number[] = []
  private moveHistory: Move[] = []

  constructor() {
    this.reset()
  }

  public reset(): void {
    this.currentNumbers = this.game.generateNumbers()
    this.moveHistory = []
  }

  public getNumbers(): number[] {
    return this.currentNumbers
  }

  public isDeadEnd(): boolean {
    return this.moveHistory.length > 0 && this.moveHistory.at(-1)!.isDeadEnd
  }

  public isGameOver(): boolean {
    return this.moveHistory.length > 0 && this.moveHistory.at(-1)!.isGameOver
  }

  public canUndo(): boolean {
    return this.moveHistory.length > 0
  }

  public undo(): void {
    const move = this.moveHistory.pop()!
    this.currentNumbers = [...move.numbers]
  }

  public applyHint(): number {
    const move = this.game.getHint(this.currentNumbers)
    this.makeMove(move)
    return move.secondNumberIndex
  }

  public getCalculations(): string[] {
    return this.moveHistory.map(move => move.calculation)
  }

  public makeMove(move: Move): boolean {
    if (!move.isValid)
      return false
    this.moveHistory.push(move)
    this.currentNumbers = move.allNewNumbers
    return true
  }
}
