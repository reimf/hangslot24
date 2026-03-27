export class Move {
  public static readonly OPERATOR_SYMBOLS = ['+', '−', '×', '÷']

  public readonly numbers: number[]
  public readonly firstNumberIndex: number
  public readonly operatorIndex: number
  public readonly secondNumberIndex: number
  public readonly result: number
  public readonly isValid: boolean
  public readonly allNewNumbers: number[]
  public readonly validNewNumbers: number[]
  public readonly isDeadEnd: boolean
  public readonly isSolved: boolean
  public readonly calculation: string

  constructor(numbers: number[], firstNumberIndex: number, operatorIndex: number, secondNumberIndex: number) {
    this.numbers = numbers
    const operation = Move.operations[operatorIndex]!
    const isOrderRelevant = operation === Move.subtract || operation === Move.divide
    const hasSmallestNumberFirst = numbers[firstNumberIndex]! < numbers[secondNumberIndex]!
    const swapNumberIndices = isOrderRelevant && hasSmallestNumberFirst
    this.firstNumberIndex = swapNumberIndices ? secondNumberIndex : firstNumberIndex
    this.secondNumberIndex = swapNumberIndices ? firstNumberIndex : secondNumberIndex
    this.operatorIndex = operatorIndex
    const firstNumber = this.numbers[this.firstNumberIndex]!
    const secondNumber = this.numbers[this.secondNumberIndex]!
    this.result = operation(firstNumber, secondNumber)
    this.isValid = !isNaN(this.result)
    this.allNewNumbers = this.numbers.with(this.firstNumberIndex, NaN).with(this.secondNumberIndex, this.result)
    this.validNewNumbers = this.allNewNumbers.filter(number => !isNaN(number))
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
