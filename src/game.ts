import { Move } from './move.js'

export class Game {
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  public generateNumbers(): number[] {
    while (true) {
      const numbers = Array.from({ length: 4 }, () => this.randomInt(1, 9))
      if (this.hasSolution(numbers))
        return numbers
    }
  }

  private hasSolution(numbers: number[]): boolean {
    for (let firstNumberIndex = 0; firstNumberIndex < numbers.length; firstNumberIndex++) {
      for (let secondNumberIndex = firstNumberIndex + 1; secondNumberIndex < numbers.length; secondNumberIndex++) {
        for (let operatorIndex = 0; operatorIndex < 4; operatorIndex++) {
          const move = new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (move.isGameOver || (move.isValid && this.hasSolution(move.validNewNumbers)))
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
        for (let operatorIndex = 0; operatorIndex < 4; operatorIndex++) {
          const move = new Move(numbers, firstNumberIndex, operatorIndex, secondNumberIndex)
          if (move.isValid && this.hasSolution(move.validNewNumbers))
            hints.push(move)
        }
      }
    }
    return hints[this.randomInt(0, hints.length - 1)]!
  }
}
