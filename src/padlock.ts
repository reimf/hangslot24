import { Button } from './button.js'
import { Level } from './level.js'
import { State } from './state.js'

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButton = new Button(document.querySelector<SVGElement>('.undo-button')!)
  private readonly hintButton = new Button(document.querySelector<SVGElement>('.hint-button')!)
  private readonly calculationTexts = Array.from(document.querySelectorAll<SVGElement>('.calculation'))
  private level = Level.EASY
  private readonly state = new State(this.level)
  private startsInThisLevel = 0

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
    this.state.makeSelectedMove()
    this.updateUI()
  }

  private onClickOperatorButton(index: number): void {
    this.state.selectOperator(index)
    this.state.makeSelectedMove()
    this.updateUI()
  }

  private onClickUndoButton(): void {
    this.state.undoMove()
    this.updateUI()
  }

  private onClickHintButton(): void {
    this.state.applyHint()
    this.updateUI()
  }

  private start(): void {
    if (this.startsInThisLevel >= 3) {
      this.level = this.level.nextLevel()
      this.startsInThisLevel++
    }
    this.state.reset(this.level)
    this.startsInThisLevel++
    this.updateUI()
  }

  private updateUI(): void {
    this.updateNumbers()
    this.updateOperators()
    this.updateUndo()
    this.updateHint()
    this.updateCalculations()
    this.updateLevel()
    this.updateShackle()
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
    this.hintButton.disable(this.state.isFinished())
  }

  private updateCalculations(): void {
    this.calculationTexts.forEach((text, index) => {
      text.textContent = this.state.getCalculation(index)
    })
  }

  private updateLevel(): void {
    const shackleElement = document.querySelector<SVGGElement>('#shackle')!
    shackleElement.classList.remove(...Array.from(shackleElement.classList))
    shackleElement.classList.add(this.level.cssClass)
    const ratingElement = document.querySelector<SVGTextElement>('#rating')!
    ratingElement.textContent = this.level.rating
    const levelElement = document.querySelector<SVGTextElement>('#level')!
    levelElement.textContent = this.level.text
  }

  private updateShackle(): void {
    if (!this.state.isSolved())
      return
    const shackle = document.querySelector('#shackle') as SVGGElement
    setTimeout(() => shackle.classList.add('animation-up'), 0)
    setTimeout(() => shackle.classList.add('animation-left'), 1000)
    setTimeout(() => shackle.classList.add('animation-right'), 2000)
    setTimeout(() => shackle.classList.add('animation-down'), 3000)
    setTimeout(() => shackle.classList.remove('animation-up', 'animation-left', 'animation-right', 'animation-down'), 4000)
    setTimeout(() => this.start(), 4500)
  }
}
