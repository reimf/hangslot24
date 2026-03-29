import { Move, PartialPermutation } from './move.js'
import { Combination, FullPermutation } from './combination.js'
import { Level } from './level.js'

export class Game {
  constructor() {
    Combination.generateAll()
  }

  private randomInt(length: number): number {
    return Math.floor(Math.random() * length)
  }

  public getPermutation(minLevel: Level, maxLevel: Level): FullPermutation {
    const combinations = Level.combinationsInRange(minLevel, maxLevel)
    const randomIndex = this.randomInt(combinations.length)
    const combination = combinations[randomIndex]!
    return combination.getRandomPermutation()
  }

  private hasSolution(numbers: PartialPermutation): boolean {
    if (numbers.length === 1)
      return numbers[0] === 24
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = 0; secondNumberIndex < numbers.length; secondNumberIndex++) {
        if (firstNumberIndex === secondNumberIndex)
          continue
        for (let operatorIndex = 0; operatorIndex < Move.OPERATOR_SYMBOLS.length; operatorIndex++) {
          const move = new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (move.isSolved || (move.isValid && this.hasSolution(move.validNewNumbers)))
            return true
        }
      }
    }
    return false
  }

  public getHint(numbers: PartialPermutation): Move {
    const hints: Move[] = []
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = 0; secondNumberIndex < numbers.length; secondNumberIndex++) {
        if (firstNumberIndex === secondNumberIndex)
          continue
        for (let operatorIndex = 0; operatorIndex < Move.OPERATOR_SYMBOLS.length; operatorIndex++) {
          const move = new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (move.isValid && this.hasSolution(move.validNewNumbers))
            hints.push(move)
        }
      }
    }
    return hints[this.randomInt(hints.length)]!
  }
}
