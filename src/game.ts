import { Move, PartialPermutation } from './move.js'
import { Combination, FullPermutation } from './combination.js'
import { Level } from './level.js'

export class Game {
  public static initialise(): void {
    for (const combination of Combination.generateAll())
      Level.addCombination(combination)
  }

  private randomInt(length: number): number {
    return Math.floor(Math.random() * length)
  }

  public getRandomPermutation(level: Level): FullPermutation {
    const combination = level.getRandomCombination()
    return combination.getRandomPermutation()
  }

  private *generateMoves(numbers: PartialPermutation): Generator<Move> {
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++)
      for (let secondNumberIndex = 0; secondNumberIndex < numbers.length; secondNumberIndex++) {
        if (firstNumberIndex === secondNumberIndex)
          continue
        for (let operatorIndex = 0; operatorIndex < Move.OPERATOR_SYMBOLS.length; operatorIndex++)
          yield new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
      }
  }

  private hasSolution(numbers: PartialPermutation): boolean {
    if (numbers.length === 1)
      return numbers[0] === 24
    for (const move of this.generateMoves(numbers))
      if (move.isSolved || (move.isValid && this.hasSolution(move.validNewNumbers)))
        return true
    return false
  }

  public getHint(numbers: PartialPermutation): Move | undefined {
    const hints: Move[] = []
    for (const move of this.generateMoves(numbers))
      if (move.isValid && this.hasSolution(move.validNewNumbers))
        hints.push(move)
    return hints[this.randomInt(hints.length)]
  }
}
