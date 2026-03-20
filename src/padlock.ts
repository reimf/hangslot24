import { Button } from './button.js'
import { Game } from './game.js'

export class Padlock {
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
    this.game = new Game()
    this.start()
  }

  private start(): void {
    const numbers = this.game.generateNumbers()
    this.setStateHistory([])
    this.setNumberButtons(numbers)
    this.enableOperatorButtons()
    this.resetSelectedButtons()
    this.setDeadEnd(false)
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

  private enableOperatorButtons(): void {
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

  private setDeadEnd(isDeadEnd: boolean): void {
    this.numberAndOperatorButtons.forEach(button => button.disable(isDeadEnd))
  }

  private setCalculating(isCalculating: boolean): void {
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
    this.setDeadEnd(false)
  }

  private onClickOperatorButton(button: Button): void {
    if (!button.isUsable() || this.firstSelectedNumberButton === null)
      return
    this.setSelectedOperatorButton(button)
  }

  private onClickNumberButton(button: Button): void {
    if (!button.isUsable())
      return
    if (this.firstSelectedNumberButton === button) {
      this.setFirstSelectedNumberButton(null)
      this.setSelectedOperatorButton(null)
      return
    }
    if (this.firstSelectedNumberButton === null || this.selectedOperatorButton === null) {
      this.setFirstSelectedNumberButton(button)
      return
    }
    this.setSecondSelectedNumberButton(button)
    
    const firstNumber = this.getNumber(this.firstSelectedNumberButton)
    const operatorSymbol = this.selectedOperatorButton.getText()
    const secondNumber = this.getNumber(this.secondSelectedNumberButton as Button)
    const result = this.game.performCalculation(firstNumber, operatorSymbol, secondNumber)
    if (isNaN(result)) {
      this.resetSelectedButtons()
      return
    }

    const oldState = this.numberButtons.map(button => this.getNumber(button))
    this.setStateHistory([oldState, ...this.stateHistory])

    this.setCalculating(true)
    this.secondSelectedNumberButton!.hide(true)
    this.setSelectedOperatorButton(null)
    this.setSecondSelectedNumberButton(null)

    this.firstSelectedNumberButton.setText(`${firstNumber}${operatorSymbol}${secondNumber}`)

    setTimeout(() => {
      this.firstSelectedNumberButton!.setText(String(result))
      this.setCalculating(false)
      const numbers = this.numberButtons.map(button => this.getNumber(button)).filter(number => !isNaN(number))
      if (this.game.checkDeadEnd(numbers)) {
        this.setDeadEnd(true)
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
        setTimeout(() => this.start(), 1000)
      }, 3000)
    }, 500)
  }
}