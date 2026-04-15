import { Combination, FullPermutation } from './combination.js'
import { Logger } from './logger.js'
import { Move, PartialPermutation } from './move.js'
import { Phase } from './phase.js'

export class State {
  public static readonly OPERATOR_SYMBOLS = Move.OPERATOR_SYMBOLS
  private readonly padlockId: ReturnType<typeof crypto.randomUUID>
  private phase = Phase.first()
  private level = this.phase.getRandomLevel()
  private combination: Combination = this.level.getRandomCombination()
  private currentNumbers: FullPermutation = [NaN, NaN, NaN, NaN]
  private moveHistory: Move[] = []
  private numberOfHintsUsed = 0
  private hasHintFailed = false
  private score = 0
  private points = 100

  constructor(padlockId: ReturnType<typeof crypto.randomUUID>) {
    this.padlockId = padlockId
    Phase.initialise()
  }

  public start(): void {
    if (this.phase.isCompleted())
      this.phase = this.phase.next()
    this.level = this.phase.getRandomLevel()
    this.combination = this.level.getRandomCombination()
    this.currentNumbers = this.combination.getRandomPermutation()
    this.moveHistory = []
    this.numberOfHintsUsed = 0
    this.hasHintFailed = false
    this.points = 100
  }

  public getMalusPoints(): number {
    const factor = this.numberOfHintsUsed === 0 ? 0.5 : 1
    return Math.floor(this.points * factor)
  }

  public decreasePoints(): void {
    if (this.points > 0)
      this.points--
  }

  public getDifficulty(): number {
    return this.level.getDifficulty()
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
    return !this.isStarted() || this.isSolved()
  }

  public isHintDisabled(): boolean {
    return this.isFinished() || this.hasHintFailed
  }

  public getPoints(): number {
    return this.points
  }

  public getScore(): number {
    return this.score
  }

  public incrementScore(): void {
    this.score += this.points
  }

  public undoMove(): void {
    const move = this.moveHistory.pop()!
    this.currentNumbers = [...(move.numbers as FullPermutation)]
    this.hasHintFailed = false
  }

  public applyHint(): Move | undefined {
    this.points = Math.max(0, this.points - this.getMalusPoints())
    this.numberOfHintsUsed++
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
    if (move.isSolved)
      Logger.log({
        padlock_id: this.padlockId,
        difficulty: this.level.getDifficulty(),
        solution_count: this.combination.solutionCount,
        number_of_hints_used: this.numberOfHintsUsed,
      })
    return move
  }
}
