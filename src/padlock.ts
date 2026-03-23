import { Button } from './button.js'
import { State } from './state.js'
import { Selector } from './selector.js'

export type Index = -1 | 0 | 1 | 2 | 3

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
      button.addEventListener('click', () => this.onClickNumberButton(index as Index))
    )
    this.operatorButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickOperatorButton(index as Index))
    )
    this.undoButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickUndoButton(index as Index))
    )
  }

  private start(): void {
    this.state.reset()
    this.selector.clear()
    this.updateInterface()
  }

  private updateInterface(): void {
    const numbers = this.state.getNumbers()
    this.numberButtons.forEach((button, index) => {
      const value = numbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(this.state.isDeadEnd() || this.state.isGameOver() || isNaN(value))
      button.select(this.selector.isNumberSelected(index as Index))
    })
    this.operatorButtons.forEach((button, index) => {
      button.disable(this.state.isDeadEnd() || this.state.isGameOver())
      button.select(this.selector.isOperatorSelected(index as Index))
    })
    this.undoButtons.forEach(button => {
      button.disable(this.state.isGameOver() || !this.state.canUndo())
    })
  }

  private onClickUndoButton(_index: Index): void {
    this.state.undo()
    this.selector.clear()
    this.updateInterface()
  }

  private onClickOperatorButton(index: Index): void {
    if (!this.selector.hasFirstNumber())
      return
    this.selector.selectOperator(index)
    this.updateInterface()
  }

  private onClickNumberButton(index: Index): void {
    if (this.selector.toggleFirstNumber(index)) {
      this.updateInterface()
      return
    }

    this.selector.selectNumber(index)
    this.updateInterface()

    if (this.selector.isInProgress())
      return

    const success = this.state.performCalculation(
      this.selector.getFirstNumberIndex(),
      this.selector.getOperatorIndex(),
      this.selector.getSecondNumberIndex()
    )

    if (!success) {
      this.selector.clear()
      this.updateInterface()
      return
    }

    this.selector.clearOperator()
    this.selector.moveSecondToFirst()
    this.updateInterface()

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