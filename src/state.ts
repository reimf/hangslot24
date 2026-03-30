import { Move, PartialPermutation } from './move.js'
import { FullPermutation } from './combination.js'
import { Game } from './game.js'
import { Level } from './level.js'
import { Selector } from './selector.js'

export class State {
  public static readonly OPERATOR_SYMBOLS = Move.OPERATOR_SYMBOLS

  private readonly game = new Game()
  private readonly selector = new Selector()
  private currentNumbers: FullPermutation = [NaN, NaN, NaN, NaN]
  private moveHistory: Move[] = []

  constructor(level: Level) {
    this.reset(level, level)
  }

  public reset(minLevel: Level, maxLevel: Level): void {
    this.currentNumbers = this.game.getPermutation(minLevel, maxLevel)
    this.moveHistory = []
    this.selector.clear()
  }

  public getNumbers(): PartialPermutation {
    return this.currentNumbers
  }

  public isStarted(): boolean {
    return this.moveHistory.length > 0
  }

  private isDeadEnd(): boolean {
    return this.moveHistory.at(-1)?.isDeadEnd ?? false
  }

  public isSolved(): boolean {
    return this.moveHistory.at(-1)?.isSolved ?? false
  }

  public isFinished(): boolean {
    return this.isSolved() || this.isDeadEnd()
  }

  public undoMove(): void {
    const move = this.moveHistory.pop()!
    this.currentNumbers = [...(move.numbers as FullPermutation)]
    this.selector.clear()
  }

  public applyHint(): void {
    const move = this.game.getHint(this.currentNumbers)!
    console.log(move)
    this.makeMove(move)
  }

  public getCalculation(step: number): string {
    return this.moveHistory.at(step)?.calculation ?? ''
  }

  public selectNumber(index: number): void {
    this.selector.selectNumber(index)
  }

  public selectOperator(index: number): void {
    this.selector.selectOperator(index)
  }

  public isNumberSelected(index: number): boolean {
    return this.selector.isNumberSelected(index)
  }

  public isOperatorSelected(index: number): boolean {
    return this.selector.isOperatorSelected(index)
  }

  public makeSelectedMove(): void {
    if (this.selector.isInProgress())
      return
    const move = new Move(this.currentNumbers, this.selector.firstNumberIndex!, this.selector.operatorIndex!, this.selector.secondNumberIndex!)
    if (move.isValid) {
      this.makeMove(move)
      return
    }
    const reversedMove = new Move(this.currentNumbers, this.selector.secondNumberIndex!, this.selector.operatorIndex!, this.selector.firstNumberIndex!)
    if (reversedMove.isValid) {
      this.makeMove(reversedMove)
      return
    }
    this.selector.clear()
  }

  private makeMove(move: Move): void {
    this.moveHistory.push(move)
    this.currentNumbers = move.allNewNumbers as FullPermutation
    this.selector.clear(move.secondNumberIndex)
  }
}
