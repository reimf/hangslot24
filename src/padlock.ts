import { Button } from './button.js'
import { Move } from './move.js'
import { State } from './state.js'
import { Selector } from './selector.js'

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButton = new Button(document.querySelector<SVGElement>('.undo-button')!)
  private readonly hintButton = new Button(document.querySelector<SVGElement>('.hint-button')!)
  private readonly calculationTexts = Array.from(document.querySelectorAll<SVGElement>('.calculation'))
  private readonly state = new State()
  private readonly selector = new Selector()

  constructor() {
    this.wireButtons()
    this.start()
  }

  private wireButtons(): void {
    this.numberButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickNumberButton(index))
    )
    this.operatorButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickOperatorButton(index))
    )
    this.undoButton.addEventListener('click', () => this.onClickUndoButton())
    this.hintButton.addEventListener('click', () => this.onClickHintButton())
  }

  private onClickNumberButton(index: number): void {
    this.selector.selectNumber(index)
    this.updateButtons()
    this.tryCalculate()
  }

  private onClickOperatorButton(index: number): void {
    this.selector.selectOperator(index)
    this.updateButtons()
    this.tryCalculate()
  }

  private onClickUndoButton(): void {
    this.state.undo()
    this.selector.clear()
    this.updateButtons()
  }

  private onClickHintButton(): void {
    const resultIndex = this.state.applyHint()
    this.selector.clear(resultIndex)
    this.updateButtons()
  }

  private start(): void {
    this.state.reset()
    this.selector.clear()
    this.updateButtons()
  }

  private updateButtons(): void {
    this.updateNumbers(this.state.getNumbers())
    this.updateOperators()
    this.updateUndo()
    this.updateHint()
    this.updateCalculations()
  }

  private updateNumbers(numbers: number[]): void {
    this.numberButtons.forEach((button, index) => {
      const value = numbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(this.state.isDeadEnd() || this.state.isGameOver() || isNaN(value))
      button.select(this.selector.isNumberSelected(index))
    })
  }

  private updateOperators(): void {
    this.operatorButtons.forEach((button, index) => {
      button.setText(Move.OPERATOR_SYMBOLS[index]!)
      button.disable(this.state.isDeadEnd() || this.state.isGameOver())
      button.select(this.selector.isOperatorSelected(index))
    })
  }

  private updateUndo(): void {
    this.undoButton.setText(State.UNDO_SYMBOL)
    this.undoButton.disable(this.state.isGameOver() || !this.state.canUndo())
  }

  private updateHint(): void {
    this.hintButton.setText(State.HINT_SYMBOL)
    this.hintButton.disable(this.state.getCalculations().length > 0)
  }

  private updateCalculations(): void {
    const calculations = this.state.getCalculations()
    this.calculationTexts.forEach((text, index) => {
      text.textContent = calculations[index] ?? ''
    })
  }

  private tryCalculate(): void {
    if (this.selector.isInProgress())
      return

    const move = this.selector.getMove(this.state.getNumbers())
    if (!this.state.makeMove(move)) {
      this.selector.clear()
      this.updateButtons()
      return
    }

    this.selector.clear(move.secondNumberIndex)
    this.updateButtons()

    if (this.state.isGameOver())
      this.openAndClosePadlock()
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  private async openAndClosePadlock(): Promise<void> {
    const shackle = document.querySelector('#shackle') as SVGGElement
    shackle.classList.add('up')
    await this.delay(1000)
    shackle.classList.add('left')
    await this.delay(1000)
    shackle.classList.add('right')
    await this.delay(1000)
    shackle.classList.add('down')
    await this.delay(1000)
    shackle.classList.remove(...Array.from(shackle.classList))
    this.start()
  }
}
