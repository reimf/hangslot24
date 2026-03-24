import { Game } from './game.js'

export class State {
  private readonly game = new Game()
  private currentNumbers: number[] = []
  private numbersHistory: number[][] = []
  private deadEnd: boolean = false
  private gameOver: boolean = false

  constructor() {
    this.reset()
  }

  public reset(): void {
    this.currentNumbers = this.game.generateNumbers()
    this.numbersHistory = []
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
    return this.numbersHistory.length > 0
  }

  public undo(): void {
    if (this.numbersHistory.length > 0) {
      this.currentNumbers = this.numbersHistory.pop()!
      this.deadEnd = false
    }
  }

  public performCalculation(firstIndex: number, operatorIndex: number, secondIndex: number): boolean {
    const firstNumber = this.currentNumbers[firstIndex]!
    const secondNumber = this.currentNumbers[secondIndex]!
    const result = this.game.performCalculation(firstNumber, operatorIndex, secondNumber)
    
    if (isNaN(result))
      return false

    this.numbersHistory.push([...this.currentNumbers])
    this.currentNumbers[firstIndex] = NaN
    this.currentNumbers[secondIndex] = result

    const validNumbers = this.currentNumbers.filter(number => !isNaN(number))
    this.deadEnd = this.game.checkDeadEnd(validNumbers)
    this.gameOver = this.game.checkGameOver(validNumbers)

    return true
  }
}
