import { Button } from './button.js'
import { Selector } from './selector.js'
import { State } from './state.js'

export class Padlock {
  private readonly padlock = document.querySelector('#padlock')!
  private readonly shackle = document.querySelector('#shackle')!
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButton = new Button(document.querySelector<SVGElement>('.undo-button')!)
  private readonly hintButton = new Button(document.querySelector<SVGElement>('.hint-button')!)
  private readonly calculationTexts = Array.from(document.querySelectorAll<SVGElement>('.calculation'))
  private readonly scoreText = document.querySelector<SVGTextElement>('#score')!
  private readonly pointsText = document.querySelector<SVGTextElement>('#points')!
  private readonly selector = new Selector()
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
    this.selector.selectNumber(index)
    if (this.selector.isComplete())
      this.makeSelectedMove()
    this.updateUI()
  }

  private onClickOperatorButton(index: number): void {
    this.selector.selectOperator(index)
    if (this.selector.isComplete())
      this.makeSelectedMove()
    this.updateUI()
  }

  private onClickUndoButton(): void {
    this.state.undoMove()
    this.selector.clear()
    this.updateUI()
  }

  private onClickHintButton(): void {
    const move = this.state.applyHint()
    if (move !== undefined) {
      this.selector.clear()
      this.selector.selectNumber(move.secondNumberIndex)
    }
    this.updateUI()
  }

  private makeSelectedMove(): void {
    const [firstNumberIndex, operatorIndex, secondNumberIndex] = this.selector.getSelection()
    const move = this.state.tryMove(firstNumberIndex, operatorIndex, secondNumberIndex)
    this.selector.clear()
    if (move !== undefined)
      this.selector.selectNumber(move.secondNumberIndex)
  }

  private start(): void {
    this.state.start()
    this.selector.clear()
    this.updateUI()
  }

  private updateUI(): void {
    this.updateNumbers()
    this.updateOperators()
    this.updateUndo()
    this.updateHint()
    this.updateCalculations()
    this.updateLevel()
    this.updateScore()
    this.updatePoints()
    if (this.state.isSolved())
      this.startAnimation()
  }

  private updateNumbers(): void {
    const numbers = this.state.getNumbers()
    this.numberButtons.forEach((button, index) => {
      const value = numbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(isNaN(value) || this.state.isFinished())
      button.select(this.selector.isNumberSelected(index))
    })
  }

  private updateOperators(): void {
    this.operatorButtons.forEach((button, index) => {
      button.setText(State.OPERATOR_SYMBOLS[index]!)
      button.disable(this.state.isFinished())
      button.select(this.selector.isOperatorSelected(index))
    })
  }

  private updateUndo(): void {
    this.undoButton.setText('↶')
    this.undoButton.disable(this.state.isUndoDisabled())
  }

  private updateHint(): void {
    this.hintButton.setText('💡')
    this.hintButton.disable(this.state.isHintDisabled())
  }

  private updateCalculations(): void {
    this.calculationTexts.forEach((text, index) => {
      text.textContent = this.state.getCalculation(index)
    })
  }

  private updateLevel(): void {
    this.padlock.classList.remove('level-easy', 'level-medium', 'level-hard')
    this.padlock.classList.add(this.state.getLevelCssClass())
  }

  private updateScore(): void {
    this.scoreText.textContent = this.state.getScore()
  }

  private updatePoints(): void {
    this.pointsText.textContent = this.state.getPoints()
  }

  private async startAnimation(): Promise<void> {
    this.shackle.classList.add('move-shackle-up')
    await this.sleep(1000)
    this.shackle.classList.add('mirror-shackle-left')
    await this.sleep(500)
    this.pointsText.classList.add('move-points-to-score')
    await this.sleep(1000)
    this.state.incrementScore()
    this.updateScore()
    this.pointsText.classList.add('hide-points')
    await this.sleep(500)
    this.shackle.classList.add('mirror-shackle-right')
    await this.sleep(1000)
    this.shackle.classList.add('move-shackle-down')
    await this.sleep(1000)
    this.shackle.classList.remove('move-shackle-up', 'mirror-shackle-left', 'mirror-shackle-right', 'move-shackle-down')
    this.start()
    await this.sleep(500)
    this.pointsText.classList.remove('move-points-to-score', 'hide-points')
  }

  private sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
}
