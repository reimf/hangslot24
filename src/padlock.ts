import { Button } from './button.js'
import { State } from './state.js'

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButton = new Button(document.querySelector<SVGElement>('.undo-button')!)
  private readonly hintButton = new Button(document.querySelector<SVGElement>('.hint-button')!)
  private readonly calculationTexts = Array.from(document.querySelectorAll<SVGElement>('.calculation'))
  private readonly state = new State()

  constructor() {
    this.wireButtons()
    this.start()
  }

  private wireButtons(): void {
    this.numberButtons.forEach((button, index) =>
      button.addClickListener(() => this.onClickNumberButton(index))
    )
    this.operatorButtons.forEach((button, index) =>
      button.addClickListener(() => this.onClickOperatorButton(index))
    )
    this.undoButton.addClickListener(() => this.onClickUndoButton())
    this.hintButton.addClickListener(() => this.onClickHintButton())
  }

  private onClickNumberButton(index: number): void {
    this.state.selectNumber(index)
    this.updateButtons()
    this.tryCalculate()
  }

  private onClickOperatorButton(index: number): void {
    this.state.selectOperator(index)
    this.updateButtons()
    this.tryCalculate()
  }

  private onClickUndoButton(): void {
    this.state.undoMove()
    this.updateButtons()
  }

  private onClickHintButton(): void {
    this.state.applyHint()
    this.updateButtons()
  }

  private start(): void {
    this.state.reset()
    this.updateButtons()
  }

  private updateButtons(): void {
    this.updateNumbers()
    this.updateOperators()
    this.updateUndo()
    this.updateHint()
    this.updateCalculations()
  }

  private updateNumbers(): void {
    const numbers = this.state.getNumbers()
    this.numberButtons.forEach((button, index) => {
      const value = numbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(isNaN(value) || this.state.isFinished())
      button.select(this.state.isNumberSelected(index))
    })
  }

  private updateOperators(): void {
    this.operatorButtons.forEach((button, index) => {
      button.setText(State.OPERATOR_SYMBOLS[index]!)
      button.disable(this.state.isFinished())
      button.select(this.state.isOperatorSelected(index))
    })
  }

  private updateUndo(): void {
    this.undoButton.setText('↶')
    this.undoButton.disable(!this.state.isStarted())
  }

  private updateHint(): void {
    this.hintButton.setText('ⓘ')
    this.hintButton.disable(this.state.isStarted() && !this.state.isFinished())
  }

  private updateCalculations(): void {
    this.calculationTexts.forEach((text, index) => {
      text.textContent = this.state.getCalculation(index)
    })
  }

  private tryCalculate(): void {
    this.state.makeSelectedMove()
    this.updateButtons()
    if (this.state.isSolved())
      this.openAndClosePadlock()
  }

  private openAndClosePadlock(): void {
    const shackle = document.querySelector('#shackle') as SVGGElement
    setTimeout(() => shackle.classList.add('up'), 0)
    setTimeout(() => shackle.classList.add('left'), 1000)
    setTimeout(() => shackle.classList.add('right'), 2000)
    setTimeout(() => shackle.classList.add('down'), 3000)
    setTimeout(() => shackle.classList.remove(...Array.from(shackle.classList)), 4000)
    setTimeout(() => this.start(), 4500)
  }
}
