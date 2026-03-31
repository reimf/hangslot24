import { Move, PartialPermutation } from './move.js'

export type FullPermutation = [number, number, number, number]

export class Combination {
  private readonly numbers: FullPermutation
  public readonly solutionCount: number

  constructor(a: number, b: number, c: number, d: number) {
    this.numbers = [a, b, c, d]
    this.solutionCount = this.getCount()
  }

  public static *generateAll(): Generator<Combination> {
    for (let a = 1; a <= 9; a++)
      for (let b = a; b <= 9; b++)
        for (let c = b; c <= 9; c++)
          for (let d = c; d <= 9; d++)
            yield new Combination(a, b, c, d)
  }

  public getRandomPermutation(): FullPermutation {
    const permutation = [...this.numbers]
    for (let i = permutation.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = permutation[i]!
      permutation[i] = permutation[j]!
      permutation[j] = temp
    }
    return permutation as FullPermutation
  }

  private getCount(): number {
    let count = 0
    for (let i = 0; i < this.numbers.length; i++) {
      for (let j = i + 1; j < this.numbers.length; j++) {
        for (let k = j + 1; k < this.numbers.length; k++) {
          for (let l = k + 1; l < this.numbers.length; l++) {
            const permutation = [this.numbers[i]!, this.numbers[j]!, this.numbers[k]!, this.numbers[l]!] as PartialPermutation
            count += Combination.countSolutionsForPermutation(permutation)
          }
        }
      }
    }
    return count
  }

  private static countSolutionsForPermutation(numbers: PartialPermutation): number {
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
          count += Combination.countSolutionsForPermutation([...remainingNumbers, move.result] as PartialPermutation)
        }
      }
    }
    return count
  }
}
