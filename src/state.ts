import { Game } from './game.js'

interface Change {
  numbers: number[]
  calculation: string
}

export class State {
  private readonly game = new Game()
  private currentNumbers: number[] = []
  private changeHistory: Change[] = []
  private deadEnd: boolean = false
  private gameOver: boolean = false

  constructor() {
    this.reset()
  }

  public reset(): void {
    this.currentNumbers = this.game.generateNumbers()
    this.changeHistory = []
    this.deadEnd = false
    this.gameOver = false
  }

  public getNumbers(): number[] {
    return this.currentNumbers
  }

  public getOperatorSymbols(): string[] {
    return ['+', '−', '×', '÷']
  }

  public getUndoSymbols(): string[] {
    return ['↶']
  }

  public isDeadEnd(): boolean {
    return this.deadEnd
  }

  public isGameOver(): boolean {
    return this.gameOver
  }

  public canUndo(): boolean {
    return this.changeHistory.length > 0
  }

  public undo(): void {
    const change = this.changeHistory.pop()!
    this.currentNumbers = change.numbers
    this.deadEnd = false
  }

  public getCalculationHistory(): string[] {
    return this.changeHistory.map(change => change.calculation)
  }

  public performCalculation(firstIndex: number, operatorIndex: number, secondIndex: number): boolean {
    const firstNumber = this.currentNumbers[firstIndex]!
    const secondNumber = this.currentNumbers[secondIndex]!
    const moveOrdered = { a: firstNumber, operatorIndex, b: secondNumber}
    const moveReversed = { a: secondNumber, operatorIndex, b: firstNumber}
    const resultOrdered = this.game.performCalculation(moveOrdered)
    const resultReversed = this.game.performCalculation(moveReversed)
    const result = resultOrdered || resultReversed
    if (isNaN(result))
      return false

    const operatorSymbol = this.getOperatorSymbols()[operatorIndex]!
    const calculationOrdered = `${firstNumber} ${operatorSymbol} ${secondNumber} = ${result}`
    const calculationReversed = `${secondNumber} ${operatorSymbol} ${firstNumber} = ${result}`
    const calculation = resultOrdered ? calculationOrdered : calculationReversed

    this.changeHistory.push({ numbers: [...this.currentNumbers], calculation })
    this.currentNumbers[firstIndex] = NaN
    this.currentNumbers[secondIndex] = result

    const validNumbers = this.currentNumbers.filter(number => !isNaN(number))
    this.deadEnd = this.game.checkDeadEnd(validNumbers)
    this.gameOver = this.game.checkGameOver(validNumbers)

    return true
  }
}
