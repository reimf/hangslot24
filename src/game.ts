export interface Move {
  a: number
  operatorIndex: number
  b: number
}

export class Game {
  private readonly TWENTYFOUR = 24
  private readonly operations = [
    this.add,
    this.subtract,
    this.multiply,
    this.divide,
  ]

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
    if (numbers.length === 1)
      return numbers[0] === this.TWENTYFOUR
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j)
          continue
        const otherNumbers = numbers.filter((_, index) => index !== i && index !== j)
        const a = numbers[i]!
        const b = numbers[j]!
        const results = this.operations
          .map(operation => operation(a, b))
          .filter(result => !isNaN(result))
        if (results.some(result => this.hasSolution([result, ...otherNumbers])))
          return true
      }
    }
    return false
  }

  public getHint(numbers: number[]): Move | null {
    const shuffled = [...numbers]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    for (let i = 0; i < shuffled.length; i++) {
      for (let j = 0; j < shuffled.length; j++) {
        if (i === j)
          continue
        const otherNumbers = shuffled.filter((_, index) => index !== i && index !== j)
        const a = shuffled[i]!
        const b = shuffled[j]!
        for (let operatorIndex = 0; operatorIndex < this.operations.length; operatorIndex++) {
          const result = this.operations[operatorIndex]!(a, b)
          if (!isNaN(result) && this.hasSolution([result, ...otherNumbers]))
            return { a, operatorIndex, b }
        }
      }
    }
    return null
  }

  private add(a: number, b: number): number {
    return a + b
  }

  private subtract(a: number, b: number): number {
    return a < b ? NaN : a - b
  }

  private multiply(a: number, b: number): number {
    return a * b
  }

  private divide(a: number, b: number): number {
    return b === 0 || a % b !== 0 ? NaN : a / b
  }

  public performCalculation(move: Move): number {
    const operation = this.operations[move.operatorIndex]!
    return operation(move.a, move.b)
  }

  public checkDeadEnd(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] !== this.TWENTYFOUR
  }

  public checkGameOver(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] === this.TWENTYFOUR
  }
}
