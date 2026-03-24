import { Button } from './button.js'
import { State } from './state.js'
import { Selector } from './selector.js'

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButtons = Array.from(document.querySelectorAll<SVGElement>('.undo-button')).map(el => new Button(el))
  private readonly state = new State()
  private readonly selector = new Selector()

  constructor() {
    this.wireButtons()
    this.start()
  }

  private wireButtons(): void {
    this.numberButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickNumberButton(index as number))
    )
    this.operatorButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickOperatorButton(index as number))
    )
    this.undoButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickUndoButton(index as number))
    )
  }

  private start(): void {
    this.state.reset()
    this.selector.clear()
    this.updateButtons()
  }

  private updateButtons(): void {
    this.updateNumbers(this.state.getNumbers())
    this.updateOperators(this.state.getOperatorSymbols())
    this.updateUndo(this.state.getUndoSymbols())
  }

  private updateNumbers(numbers: number[]): void {
    this.numberButtons.forEach((button, index) => {
      const value = numbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(this.state.isDeadEnd() || this.state.isGameOver() || isNaN(value))
      button.select(this.selector.isNumberSelected(index as number))
    })
  }

  private updateOperators(operatorSymbols: string[]): void {
    this.operatorButtons.forEach((button, index) => {
      button.setText(operatorSymbols[index]!)
      button.disable(this.state.isDeadEnd() || this.state.isGameOver())
      button.select(this.selector.isOperatorSelected(index as number))
    })
  }

  private updateUndo(undoSymbols: string[]): void {
    this.undoButtons.forEach((button, index) => {
      button.setText(undoSymbols[index]!)
      button.disable(this.state.isGameOver() || !this.state.canUndo())
    })
  }

  private onClickUndoButton(_index: number): void {
    this.state.undo()
    this.selector.clear()
    this.updateButtons()
  }

  private onClickOperatorButton(index: number): void {
    if (!this.selector.hasFirstNumber())
      return
    this.selector.selectOperator(index)
    this.updateButtons()
  }

  private onClickNumberButton(index: number): void {
    if (this.selector.toggleFirstNumber(index)) {
      this.updateButtons()
      return
    }

    this.selector.selectNumber(index)
    this.updateButtons()

    if (this.selector.isInProgress())
      return

    const success = this.state.performCalculation(
      this.selector.getFirstNumberIndex(),
      this.selector.getOperatorIndex(),
      this.selector.getSecondNumberIndex()
    )

    if (!success) {
      this.selector.clear()
      this.updateButtons()
      return
    }

    this.selector.clearOperator()
    this.selector.moveSecondToFirst()
    this.updateButtons()

    if (this.state.isGameOver())
      this.openAndClosePadlock()
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