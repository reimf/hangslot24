import { Move } from './move.js'

export class Game {
  private randomInt(length: number): number {
    return Math.floor(Math.random() * length)
  }

  public generateNumbers(): number[] {
    while (true) {
      const numbers = Array.from({ length: 4 }, () => 1 + this.randomInt(9))
      if (this.hasSolution(numbers))
        return numbers
    }
  }

  private hasSolution(numbers: number[]): boolean {
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = firstNumberIndex + 1; secondNumberIndex < numbers.length; secondNumberIndex++) {
        for (let operatorIndex = 0; operatorIndex < Move.OPERATOR_SYMBOLS.length; operatorIndex++) {
          const move = new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (move.isSolved || (move.isValid && this.hasSolution(move.validNewNumbers)))
            return true
        }
      }
    }
    return false
  }

  public getHint(numbers: number[]): Move {
    const hints: Move[] = []
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = firstNumberIndex + 1; secondNumberIndex < numbers.length; secondNumberIndex++) {
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
