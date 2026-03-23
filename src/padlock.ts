import { Button } from './button.js'
import { Game } from './game.js'

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButtons = Array.from(document.querySelectorAll<SVGElement>('.undo-button')).map(el => new Button(el))
  private readonly game = new Game()

  // State
  private currentNumbers: number[] = []
  private firstSelectedNumberButton: Button|null = null
  private secondSelectedNumberButton: Button|null = null
  private selectedOperatorButton: Button|null = null
  private numbersHistory: number[][] = []
  private isDeadEnd: boolean = false
  private isCalculating: boolean = false
  private isGameOver: boolean = false

  constructor() {
    this.wireButtons()
    this.start()
  }

  private wireButtons(): void {
    this.numberButtons.forEach(button =>
      button.addEventListener('click', () => button.isUsable() && this.onClickNumberButton(button))
    )
    this.operatorButtons.forEach(button =>
      button.addEventListener('click', () => button.isUsable() && this.onClickOperatorButton(button))
    )
    this.undoButtons.forEach(button =>
      button.addEventListener('click', () => button.isUsable() && this.onClickUndoButton(button))
    )
  }

  private start(): void {
    this.currentNumbers = this.game.generateNumbers()
    this.numbersHistory = []
    this.isCalculating = false
    this.isDeadEnd = false
    this.isGameOver = false
    this.resetSelectedButtons()
    this.showState()
  }

  private showState(): void {
    this.numberButtons.forEach((button, column) => {
      const value = this.currentNumbers[column]!
      button.hide(isNaN(value))
      button.disable(this.isCalculating || this.isDeadEnd || this.isGameOver)
      button.select(this.firstSelectedNumberButton === button || this.secondSelectedNumberButton === button)
      button.setText(String(value))
    })
    this.operatorButtons.forEach(button => {
      button.disable(this.isCalculating || this.isDeadEnd || this.isGameOver)
      button.select(this.selectedOperatorButton === button)
    })
    this.undoButtons.forEach(button => {
      button.disable(this.isCalculating || this.isGameOver|| this.numbersHistory.length === 0)
    })
  }

  private resetSelectedButtons() {
    this.firstSelectedNumberButton = null
    this.secondSelectedNumberButton = null
    this.selectedOperatorButton = null
  }

  public getNumber(button: Button): number {
    if (button.isUsable())
      return parseInt(button.getText())
    return NaN
  }

  private onClickUndoButton(_button: Button): void {
    this.currentNumbers = this.numbersHistory.pop()!
    this.resetSelectedButtons()
    this.isDeadEnd = false
    this.showState()
  }

  private onClickOperatorButton(button: Button): void {
    if (this.firstSelectedNumberButton === null)
      return
    this.selectedOperatorButton = button
    this.showState()
  }

  private onClickNumberButton(button: Button): void {
    if (this.firstSelectedNumberButton === button) {
      this.firstSelectedNumberButton = null
      this.selectedOperatorButton = null
      this.showState()
      return
    }
    if (this.firstSelectedNumberButton === null || this.selectedOperatorButton === null) {
      this.firstSelectedNumberButton = button
      this.showState()
      return
    }
    this.secondSelectedNumberButton = button
    this.showState()
    
    const firstNumber = this.getNumber(this.firstSelectedNumberButton)
    const operatorSymbol = this.selectedOperatorButton.getText()
    const secondNumber = this.getNumber(this.secondSelectedNumberButton as Button)
    const result = this.game.performCalculation(firstNumber, operatorSymbol, secondNumber)
    if (isNaN(result)) {
      this.resetSelectedButtons()
      this.showState()
      return
    }

    this.numbersHistory.push([...this.currentNumbers]) // push a static copy of the current numbers
    const firstNumberIndex = this.numberButtons.findIndex(button => button === this.firstSelectedNumberButton)
    const secondNumberIndex = this.numberButtons.findIndex(button => button === this.secondSelectedNumberButton)
    this.currentNumbers[firstNumberIndex] = NaN
    this.currentNumbers[secondNumberIndex] = result
    this.isCalculating = true
    this.showState()
    this.selectedOperatorButton = null
    this.firstSelectedNumberButton = this.secondSelectedNumberButton
    this.secondSelectedNumberButton = null
    this.isCalculating = false
    this.showState()
    const validNumbers = this.currentNumbers.filter(number => !isNaN(number))
    if (this.game.checkDeadEnd(validNumbers)) {
      this.isDeadEnd = true
      this.showState()
      return
    }
    if (this.game.checkGameOver(validNumbers)) {
      this.isGameOver = true
      this.showState()
      this.openAndClosePadlock()
      return
    }
  }

  private openAndClosePadlock(): void {
    const shackle = document.querySelector('#shackle') as SVGGElement
    shackle.classList.add('open')
    setTimeout(() => {
      shackle.classList.remove('open')
      setTimeout(() => this.start(), 1000)
    }, 3000)
  }
}