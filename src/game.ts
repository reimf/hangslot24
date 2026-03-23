export class Game {
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
      const numbers = [
        this.randomInt(1, 9),
        this.randomInt(1, 9),
        this.randomInt(1, 9),
        this.randomInt(1, 9),
      ]
      if (this.hasSolution(numbers))
        return numbers
    }
  }

  private hasSolution(numbers: number[]): boolean {
    if (numbers.length === 1)
      return numbers[0] === 24
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j)
          continue
        const otherNumbers = numbers.filter((_, index) => index !== i && index !== j)
        const a = numbers[i] as number
        const b = numbers[j] as number
        const results = this.operations
          .map(operation => operation(a, b))
          .filter(result => !isNaN(result))
        return results.some(result => this.hasSolution([result, ...otherNumbers]))
      }
    }
    return false
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

  public performCalculation(number1: number, operatorIndex: number, number2: number): number {
    const operation = this.operations[operatorIndex]!
    return operation(number1, number2)
  }

  public checkDeadEnd(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] !== 24
  }

  public checkGameOver(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] === 24
  }
}
