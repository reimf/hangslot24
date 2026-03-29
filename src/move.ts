export type PartialPermutation = [] | [number] | [number, number] | [number, number, number] | [number, number, number, number]

export class Move {
  public static readonly OPERATOR_SYMBOLS = ['+', '−', '×', '÷']

  public readonly numbers: PartialPermutation
  public readonly firstNumberIndex: number
  public readonly operatorIndex: number
  public readonly secondNumberIndex: number
  public readonly result: number
  public readonly isValid: boolean
  public readonly allNewNumbers: PartialPermutation
  public readonly validNewNumbers: PartialPermutation
  public readonly isDeadEnd: boolean
  public readonly isSolved: boolean
  public readonly calculation: string

  constructor(numbers: PartialPermutation, firstNumberIndex: number, operatorIndex: number, secondNumberIndex: number) {
    this.numbers = numbers
    this.firstNumberIndex = firstNumberIndex
    this.operatorIndex = operatorIndex
    this.secondNumberIndex = secondNumberIndex
    const firstNumber = this.numbers[this.firstNumberIndex]!
    const operation = Move.operations[operatorIndex]!
    const secondNumber = this.numbers[this.secondNumberIndex]!
    this.result = operation(firstNumber, secondNumber)
    this.isValid = !isNaN(this.result)
    this.allNewNumbers = (this.numbers as number[]).with(this.firstNumberIndex, NaN).with(this.secondNumberIndex, this.result) as PartialPermutation
    this.validNewNumbers = (this.allNewNumbers as number[]).filter(number => !isNaN(number)) as PartialPermutation
    this.isDeadEnd = this.validNewNumbers.length === 1 && this.validNewNumbers[0] !== 24
    this.isSolved = this.validNewNumbers.length === 1 && this.validNewNumbers[0] === 24
    const operatorSymbol = Move.OPERATOR_SYMBOLS[this.operatorIndex]!
    this.calculation = `${firstNumber} ${operatorSymbol} ${secondNumber} = ${this.result}`
  }

  private static add(firstNumber: number, secondNumber: number): number {
    return firstNumber + secondNumber
  }

  private static subtract(firstNumber: number, secondNumber: number): number {
    return firstNumber < secondNumber ? NaN : firstNumber - secondNumber
  }

  private static multiply(firstNumber: number, secondNumber: number): number {
    return firstNumber * secondNumber
  }

  private static divide(firstNumber: number, secondNumber: number): number {
    return secondNumber === 0 || firstNumber % secondNumber !== 0 ? NaN : firstNumber / secondNumber
  }

  private static readonly operations = [Move.add, Move.subtract, Move.multiply, Move.divide]
}
