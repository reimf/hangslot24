// ============================================================
// Hangslot24 – Game Logic (SVG-based)
// ============================================================

class Button {
  private readonly element: SVGElement

  constructor(element: SVGElement) {
    this.element = element
  }

  public isUsable(): boolean {
    return !this.element.classList.contains('disabled') && !this.element.classList.contains('hidden')
  }

  public hide(toggle: boolean): void {
    this.element.classList.toggle('hidden', toggle)
  }

  public disable(toggle: boolean): void {
    this.element.classList.toggle('disabled', toggle)
  }

  public select(toggle: boolean): void {
    this.element.classList.toggle('selected', toggle)
  }

  public setText(text: string): void {
    this.element.querySelector('text')!.textContent = text
  }

  public getText(): string {
    return this.element.querySelector('text')!.textContent!
  }

  public addEventListener(type: string, listener: EventListener): void {
    this.element.addEventListener(type, listener)
  }
}

class Calculator {
  private readonly numberButtons: Button[] = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons: Button[] = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly numberAndOperatorButtons: Button[] = [...this.numberButtons, ...this.operatorButtons]
  private readonly undoButton = new Button(document.querySelector<SVGElement>('.undo-button')!)
  private readonly allButtons = [...this.numberButtons, ...this.operatorButtons, this.undoButton]
  private firstSelectedNumberButton: Button | null = null
  private secondSelectedNumberButton: Button | null = null
  private selectedOperatorButton: Button | null = null
  private stateHistory: number[][] = []
  private game: Game

  constructor() {
    this.wireButtons()
    this.game = this.newGame()
  }

  private newGame(): Game {
    const game = new Game()
    const numbers = game.generateNumbers()
    this.setStateHistory([])
    this.setNumberButtons(numbers)
    this.resetOperatorButtons()
    this.resetSelectedButtons()
    this.setIsDeadEnd(false)
    return game
  }

  private setStateHistory(stateHistory: number[][]): void {
    this.stateHistory = stateHistory
    this.undoButton.disable(this.stateHistory.length === 0)
  }

  private setNumberButtons(numbers: number[]): void {
    this.numberButtons.forEach((button, column) => {
      const value = numbers[column]!
      button.hide(isNaN(value))
      button.disable(false)
      button.setText(String(value))
    })
  }

  private resetOperatorButtons(): void {
    this.operatorButtons.forEach(button => {
      button.disable(false)
    })
  }

  private resetSelectedButtons() {
    this.setFirstSelectedNumberButton(null)
    this.setSecondSelectedNumberButton(null)
    this.setSelectedOperatorButton(null)
  }

  private wireButtons(): void {
    this.numberButtons.forEach(button =>
      button.addEventListener('click', () => this.onClickNumberButton(button))
    )
    this.operatorButtons.forEach(button =>
      button.addEventListener('click', () => this.onClickOperatorButton(button))
    )
    this.undoButton.addEventListener('click', () => this.onClickUndoButton(this.undoButton))
  }

  private setFirstSelectedNumberButton(button: Button | null): void {
    this.firstSelectedNumberButton?.select(false)
    this.firstSelectedNumberButton = button
    this.firstSelectedNumberButton?.select(true)
  }

  private setSelectedOperatorButton(button: Button | null): void {
    this.selectedOperatorButton?.select(false)
    this.selectedOperatorButton = button
    this.selectedOperatorButton?.select(true)
  }

  private setSecondSelectedNumberButton(button: Button | null): void {
    this.secondSelectedNumberButton?.select(false)
    this.secondSelectedNumberButton = button
    this.secondSelectedNumberButton?.select(true)
  }

  private setIsDeadEnd(isDeadEnd: boolean): void {
    this.numberAndOperatorButtons.forEach(button => button.disable(isDeadEnd))
  }

  private setIsCalculating(isCalculating: boolean): void {
    this.allButtons.forEach(button => button.disable(isCalculating))
  }

  public getNumber(button: Button): number {
    if (button.isUsable())
      return parseInt(button.getText())
    return NaN
  }

  private onClickUndoButton(button: Button): void {
    if (!button.isUsable())
      return
    const previousNumbers = this.stateHistory[0]!
    this.setStateHistory(this.stateHistory.slice(1))
    this.setNumberButtons(previousNumbers)
    this.resetSelectedButtons()
    this.setIsDeadEnd(false)
  }

  private onClickOperatorButton(button: Button): void {
    if (!button.isUsable() || this.firstSelectedNumberButton === null)
      return
    this.setSelectedOperatorButton(button)
  }

  private onClickNumberButton(button: Button): void {
    if (!button.isUsable())
      return
    if (this.firstSelectedNumberButton === button && this.selectedOperatorButton === null) {
      this.setFirstSelectedNumberButton(null)
      return
    }
    if (this.firstSelectedNumberButton === null || this.selectedOperatorButton === null) {
      this.setFirstSelectedNumberButton(button)
      return
    }
    if (this.firstSelectedNumberButton === button)
      return

    this.setSecondSelectedNumberButton(button)
    const firstNumber = this.getNumber(this.firstSelectedNumberButton)
    const operatorSymbol = this.selectedOperatorButton.getText()
    const secondNumber = this.getNumber(this.secondSelectedNumberButton as Button)
    const result = this.game.performCalculation(firstNumber, operatorSymbol, secondNumber)
    if (isNaN(result)) {
      this.resetSelectedButtons()
      return
    }

    this.setIsCalculating(true)
    const oldState = this.numberButtons.map(button => this.getNumber(button))
    this.setStateHistory([oldState, ...this.stateHistory])

    this.secondSelectedNumberButton!.hide(true)
    this.setSelectedOperatorButton(null)
    this.setSecondSelectedNumberButton(null)

    // Show full expression on firstNumberButton immediately (e.g. "8+3")
    this.firstSelectedNumberButton.setText(`${firstNumber}${operatorSymbol}${secondNumber}`)

    setTimeout(() => {
      this.firstSelectedNumberButton!.setText(String(result))
      this.setIsCalculating(false)
      const numbers = this.numberButtons.filter(button => button.isUsable()).map(button => this.getNumber(button))
      if (this.game.checkDeadEnd(numbers)) {
        this.setIsDeadEnd(true)
        return
      }
      if (this.game.checkGameOver(numbers)) {
        this.openAndClosePadlock()
        return
      }
    }, 1000)
  }

  private openAndClosePadlock(): void {
    const padlock = document.getElementById('padlock')!
    setTimeout(() => {
      padlock.classList.add('open')
      setTimeout(() => {
        padlock.classList.remove('open')
        setTimeout(() => {
          this.game = this.newGame()
        }, 700)
      }, 3000)
    }, 400)
  }
}

// ============================================================
// Helpers
// ============================================================

// ============================================================
// Game
// ============================================================

class Game {
  private readonly operations = new Map([
    ['+', this.add],
    ['−', this.subtract],
    ['×', this.multiply],
    ['÷', this.divide],
  ])

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
        const results = [
          this.add(a, b),
          this.subtract(a, b),
          this.multiply(a, b),
          this.divide(a, b),
        ].filter(result => !isNaN(result))
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

  public performCalculation(number1: number, operator: string, number2: number): number {
    const operation = this.operations.get(operator)!
    return operation(number1, number2)
  }

  public checkDeadEnd(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] !== 24
  }

  public checkGameOver(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] === 24
  }
}

document.addEventListener('DOMContentLoaded', () => new Calculator())
