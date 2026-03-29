import { Move } from './move.js'
import { Level } from './level.js'

export { Level }

type Combination = [number, number, number, number]
export type FullPermutation = [number, number, number, number]
export type PartialPermutation = [] | [number] | [number, number] | [number, number, number] | [number, number, number, number]

export class Game {
  private readonly combinationsWithCount: Map<Combination, number> = new Map()

  constructor() {
    const combinations = this.getCombinations()
    this.combinationsWithCount = new Map(
      combinations.map<[Combination, number]>(combination =>
      [combination, this.countSolutionsForCombination(combination)]
    ))
  }

  private countSolutionsForPermutation(numbers: PartialPermutation): number {
    if (numbers.length === 1)
      return numbers[0] === 24 ? 1 : 0
    let count = 0
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = 0; secondNumberIndex < numbers.length; secondNumberIndex++) {
        if (firstNumberIndex === secondNumberIndex)
          continue
        const remainingNumbers = numbers.filter((_, index) => index !== firstNumberIndex && index !== secondNumberIndex)
        for (let operatorIndex = 0; operatorIndex < Move.OPERATOR_SYMBOLS.length; operatorIndex++) {
          const move = new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (!move.isValid)
            continue
          count += this.countSolutionsForPermutation([...remainingNumbers, move.result] as PartialPermutation)
        }
      }
    }
    return count
  }

  private countSolutionsForCombination(combination: Combination): number {
    const ordered = Array.from(combination)
    let count = 0
    for (let i = 0; i < ordered.length; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        for (let k = j + 1; k < ordered.length; k++) {
          for (let l = k + 1; l < ordered.length; l++) {
            const permutation = [ordered[i]!, ordered[j]!, ordered[k]!, ordered[l]!] as PartialPermutation
            count += this.countSolutionsForPermutation(permutation)
          }
        }
      }
    }
    return count
  }

  private getCombinations(): Combination[] {
    const combinations: Combination[] = []
    for (let a = 1; a <= 9; a++)
      for (let b = a; b <= 9; b++)
        for (let c = b; c <= 9; c++)
          for (let d = c; d <= 9; d++)
            combinations.push([a, b, c, d])
    return combinations
  }

  private randomInt(length: number): number {
    return Math.floor(Math.random() * length)
  }

  public getPermutation(level: Level): FullPermutation {
    const combinations = Array.from(this.combinationsWithCount.entries())
      .filter(([_, count]) => level.matchesCount(count))
      .map(([combination]) => combination)
    const randomIndex = this.randomInt(combinations.length)
    const combination = combinations[randomIndex]!
    return this.getRandomPermutation(combination)
  }

  private getRandomPermutation(combination: Combination): FullPermutation {
    const permutation = [...combination]
    for (let i = permutation.length - 1; i > 0; i--) {
      const j = this.randomInt(i + 1)
      const temp = permutation[i]!
      permutation[i] = permutation[j]!
      permutation[j] = temp
    }
    return permutation as FullPermutation
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
