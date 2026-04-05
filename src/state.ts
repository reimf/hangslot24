import { Move, PartialPermutation } from './move.js'
import { Combination, FullPermutation } from './combination.js'
import { Phase } from './phase.js'

export class State {
  public static readonly OPERATOR_SYMBOLS = Move.OPERATOR_SYMBOLS

  private phase = Phase.first()
  private level = this.phase.getRandomLevel()
  private currentNumbers: FullPermutation = [NaN, NaN, NaN, NaN]
  private moveHistory: Move[] = []
  private hasHintFailed = false
  private score = 0
  private currentPoints = 100
  private startTime: number = 0

  constructor() {
    Phase.initialise()
  }

  public start(): void {
    if (this.phase.isCompleted())
      this.phase = this.phase.next()
    this.level = this.phase.getRandomLevel()
    this.currentNumbers = this.level.getRandomCombination().getRandomPermutation()
    this.moveHistory = []
    this.hasHintFailed = false
    this.currentPoints = 100
    this.startTime = Date.now()
  }

  public getElapsedSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  public getLevelCssClass(): string {
    return this.level.getCssClass()
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

  public isUndoDisabled(): boolean {
    return !this.isStarted() || this.isFinished()
  }

  public isHintDisabled(): boolean {
    return this.isFinished() || this.hasHintFailed
  }

  public getPoints(): string {
    return `+€${this.currentPoints}`
  }

  public getScore(): string {
    return `€${this.score}`
  }

  public incrementScore(): void {
    this.score += this.currentPoints
  }

  public undoMove(): void {
    const move = this.moveHistory.pop()!
    this.currentNumbers = [...(move.numbers as FullPermutation)]
    this.hasHintFailed = false
  }

  public applyHint(): Move | undefined {
    this.currentPoints = Math.max(0, this.currentPoints - 50)
    const hints: Move[] = []
    for (let firstNumberIndex = 0; firstNumberIndex < this.currentNumbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = 0; secondNumberIndex < this.currentNumbers.length; secondNumberIndex++) {
        if (firstNumberIndex === secondNumberIndex)
          continue
        for (let operatorIndex = 0; operatorIndex < Move.OPERATOR_SYMBOLS.length; operatorIndex++) {
          const move = new Move(this.currentNumbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (move.isValid && Combination.hasSolution(move.validNewNumbers))
            hints.push(move)
        }
      }
    }
    if (hints.length === 0) {
      this.hasHintFailed = true
      return undefined
    }
    const randomIndex = Math.floor(Math.random() * hints.length)
    const move = hints[randomIndex]!
    return this.makeMove(move)
  }

  public getCalculation(step: number): string {
    return this.moveHistory.length > step ? this.moveHistory.at(step)!.calculation : ''
  }

  public tryMove(firstNumberIndex: number, operatorIndex: number, secondNumberIndex: number): Move | undefined {
    const move = new Move(this.currentNumbers, firstNumberIndex, operatorIndex, secondNumberIndex)
    if (move.isValid)
      return this.makeMove(move)
    const reversedMove = new Move(this.currentNumbers, secondNumberIndex, operatorIndex, firstNumberIndex)
    if (reversedMove.isValid)
      return this.makeMove(reversedMove)
    return undefined
  }

  private makeMove(move: Move): Move {
    this.moveHistory.push(move)
    this.currentNumbers = move.allNewNumbers as FullPermutation
    this.hasHintFailed = false
    return move
  }
}
