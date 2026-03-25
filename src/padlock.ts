import { Button } from './button.js'
import { State } from './state.js'
import { Selector } from './selector.js'

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButtons = Array.from(document.querySelectorAll<SVGElement>('.undo-button')).map(el => new Button(el))
  private readonly hintButtons = Array.from(document.querySelectorAll<SVGElement>('.hint-button')).map(el => new Button(el))
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
    this.undoButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickUndoButton(index))
    )
    this.hintButtons.forEach((button, index) =>
      button.addEventListener('click', () => this.onClickHintButton(index))
    )
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

  private onClickUndoButton(_index: number): void {
    this.state.undo()
    this.selector.clear()
    this.updateButtons()
  }

  private onClickHintButton(_index: number): void {
    const resultIndex = this.state.applyHint()
    this.selector.clear()
    this.selector.selectNumber(resultIndex)
    this.updateButtons()
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
    this.updateHint(this.state.getHintSymbols())
    this.updateCalculationHistory()
  }

  private updateNumbers(numbers: number[]): void {
    this.numberButtons.forEach((button, index) => {
      const value = numbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(this.state.isDeadEnd() || this.state.isGameOver() || isNaN(value))
      button.select(this.selector.isNumberSelected(index))
    })
  }

  private updateOperators(operatorSymbols: string[]): void {
    this.operatorButtons.forEach((button, index) => {
      button.setText(operatorSymbols[index]!)
      button.disable(this.state.isDeadEnd() || this.state.isGameOver())
      button.select(this.selector.isOperatorSelected(index))
    })
  }

  private updateUndo(undoSymbols: string[]): void {
    this.undoButtons.forEach((button, index) => {
      button.setText(undoSymbols[index]!)
      button.disable(this.state.isGameOver() || !this.state.canUndo())
    })
  }

  private updateHint(hintSymbols: string[]): void {
    this.hintButtons.forEach((button, index) => {
      button.setText(hintSymbols[index]!)
      button.disable(this.state.getCalculationHistory().length > 0)
    })
  }

  private updateCalculationHistory(): void {
    const history = this.state.getCalculationHistory()
    this.calculationTexts.forEach((text, index) => {
      text.textContent = history[index] ?? ''
    })
  }

  private tryCalculate(): void {
    if (this.selector.isInProgress())
      return

    const [firstNumberIndex, secondNumberIndex] = this.selector.getNumberIndices()
    const operatorIndex = this.selector.getOperatorIndex()
    const success = this.state.performCalculation(firstNumberIndex!, operatorIndex!, secondNumberIndex!)

    if (!success) {
      this.selector.clear()
      this.updateButtons()
      return
    }

    this.selector.clear()
    this.selector.selectNumber(secondNumberIndex!)
    this.updateButtons()

    if (this.state.isGameOver())
      this.openAndClosePadlock()
  }

  private openAndClosePadlock(): void {
    const shackle = document.querySelector('#shackle') as SVGGElement
    
    setTimeout(() => shackle.classList.add('up'), 0)
    setTimeout(() => shackle.classList.add('left'), 1000)
    setTimeout(() => shackle.classList.add('right'), 2000)
    setTimeout(() => shackle.classList.add('down'), 3000)
    setTimeout(() => {
      shackle.classList.remove(...Array.from(shackle.classList))
      this.start()
    }, 4000)
  }
}