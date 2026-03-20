// ============================================================
// Hangslot24 – Game Logic (SVG-based)
// ============================================================

// ============================================================
// Types
// ============================================================

type OperatorName = 'add' | 'subtract' | 'multiply' | 'divide'

// ============================================================
// Classes
// ============================================================

class Button {
  private readonly element: SVGElement

  constructor(element: SVGElement) {
    this.element = element
  }

  public isHidden(): boolean {
    return this.element.classList.contains('hidden')
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

  public setNumber(number: number): void {
    this.setText(number.toString())
    this.select(false)
    this.disable(false)
    this.hide(false)
  }

  public getNumber(): number {
    if (this.isHidden())
      return NaN
    return parseInt(this.getText())
  }

  public getAttribute(name: string): string | null {
    return this.element.getAttribute(name)
  }

  public addEventListener(type: string, listener: EventListener): void {
    this.element.addEventListener(type, listener)
  }
}

class State {
  private readonly numberButtons: Button[] = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons: Button[] = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButton = new Button(document.querySelector<SVGElement>('.undo-button')!)
  private firstSelectedNumberButton: Button | null = null
  private secondSelectedNumberButton: Button | null = null
  private selectedOperatorButton: Button | null = null
  private moveHistory: number[][] = []
  private isCalculating = false
  private isDeadEnd = false
  private readonly game: Game

  constructor(numbers: number[], game: Game) {
    this.game = game
    this.wireButtons()
    this.resetNumberButtons(numbers)
    this.resetOperatorButtons()
    this.resetSelectedButtons()
  }

  private resetNumberButtons(numbers: number[]): void {
    this.numberButtons.forEach((button, column) =>
      button.setNumber(numbers[column]!)
    )
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

  private setFirstSelectedNumberButton(button: Button|null): void {
    this.firstSelectedNumberButton?.select(false)
    this.firstSelectedNumberButton = button
    this.firstSelectedNumberButton?.select(true)
  }

  private setSelectedOperatorButton(button: Button|null): void {
    this.selectedOperatorButton?.select(false)
    this.selectedOperatorButton = button
    this.selectedOperatorButton?.select(true)
  }

  private setSecondSelectedNumberButton(button: Button|null): void {
    this.secondSelectedNumberButton?.select(false)
    this.secondSelectedNumberButton = button
    this.secondSelectedNumberButton?.select(true)
  }

  private onClickUndoButton(button: Button): void {
    if (this.isCalculating || this.isDeadEnd || button.isHidden() || this.moveHistory.length === 0)
      return
    const prev = this.moveHistory.pop()!
    this.numberButtons.forEach((button, column) => {
      const value = prev[column]!
      button.hide(isNaN(value))
      button.setNumber(value)
    })

    this.setFirstSelectedNumberButton(null)
    this.setSelectedOperatorButton(null)
    this.isDeadEnd = false
  }

  private onClickOperatorButton(button: Button): void {
    if (this.isCalculating || this.isDeadEnd || button.isHidden() || this.firstSelectedNumberButton === null)
      return
    this.setSelectedOperatorButton(button)
  }

  private onClickNumberButton(button: Button): void {
    if (this.isCalculating || this.isDeadEnd || button.isHidden())
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
    const firstNumber = this.firstSelectedNumberButton.getNumber()
    const operatorSymbol = this.selectedOperatorButton.getText()
    const secondNumber = this.secondSelectedNumberButton!.getNumber()
    const result = this.game.performCalculation(firstNumber, operatorSymbol, secondNumber)
    if (isNaN(result)) {
      this.resetSelectedButtons()
      return
    }

    this.moveHistory.push(this.numberButtons.map(button => button.getNumber()))

    this.isCalculating = true

    // Show full expression on firstNumberButton immediately (e.g. "8+3")
    this.firstSelectedNumberButton.setText(`${firstNumber}${operatorSymbol}${secondNumber}`)

    this.secondSelectedNumberButton!.hide(true)
    this.setSelectedOperatorButton(null)
    this.setSecondSelectedNumberButton(null)

    setTimeout(() => {
      this.firstSelectedNumberButton!.setText(String(result))
      this.isCalculating = false
      const numbers = this.numberButtons.filter(button => !button.isHidden()).map(button => button.getNumber())
      if (this.game.checkDeadEnd(numbers)) {
        this.isDeadEnd = true
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
        setTimeout(() => new Game(), 700)
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
  private readonly state: State
  
  constructor() {
    const numbers = this.generatePuzzle()
    this.state = new State(numbers, this)
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private generatePuzzle(): number[] {
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

  public performCalculation(firstNumber: number, operatorSymbol: string, secondNumber: number): number {
    const operations = new Map([
      ['+', this.add],
      ['−', this.subtract],
      ['×', this.multiply],
      ['÷', this.divide],
    ])
    return operations.get(operatorSymbol)!(firstNumber, secondNumber)
  }

  public checkDeadEnd(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] !== 24
  }

  public checkGameOver(numbers: number[]): boolean {
    return numbers.length === 1 && numbers[0] === 24
  }
}

document.addEventListener('DOMContentLoaded', () => new Game())
