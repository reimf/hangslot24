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
  private hasHintFailed = false

  constructor(level: Level) {
    this.reset(level)
  }

  public reset(level: Level): void {
    this.currentNumbers = this.game.getRandomPermutation(level)
    this.moveHistory = []
    this.selector.clear()
    this.hasHintFailed = false
  }

  public getNumbers(): PartialPermutation {
    return this.currentNumbers
  }

  public isStarted(): boolean {
    return this.moveHistory.length > 0
  }

  private isDeadEnd(): boolean {
    return this.moveHistory.length > 0 && this.moveHistory.at(-1)!.isDeadEnd
  }

  public isSolved(): boolean {
    return this.moveHistory.length > 0 && this.moveHistory.at(-1)!.isSolved
  }

  public isFinished(): boolean {
    return this.isSolved() || this.isDeadEnd()
  }

  public isHintDisabled(): boolean {
    return this.isFinished() || this.hasHintFailed
  }

  public undoMove(): void {
    const move = this.moveHistory.pop()!
    this.currentNumbers = [...(move.numbers as FullPermutation)]
    this.selector.clear()
    this.hasHintFailed = false
  }

  public applyHint(): void {
    const move = this.game.getHint(this.currentNumbers)
    if (move === undefined) {
      this.hasHintFailed = true
      return
    }
    this.makeMove(move)
  }

  public getCalculation(step: number): string {
    return this.moveHistory.length > step ? this.moveHistory.at(step)!.calculation : ''
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
    this.hasHintFailed = false
  }
}
