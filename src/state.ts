import { Button } from './button.js'

export type Callback = (button: Button) => void

export class State {
  private readonly numberButtons: Button[] = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons: Button[] = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButton = new Button(document.querySelector('.undo-button') as SVGElement)
  private readonly allButtons = [...this.numberButtons, ...this.operatorButtons, this.undoButton]
  private firstSelectedNumberButton: Button|null = null
  private secondSelectedNumberButton: Button|null = null
  private selectedOperatorButton: Button|null = null
  private numbersHistory: number[][] = []

  private wireButtons(buttons: Button[], callback: Callback): void {
    buttons.forEach(button => button.addEventListener('click', () => { if (button.isUsable()) callback(button) }))
  }

  public wireNumberButtons(callback: Callback): void {
    this.wireButtons(this.numberButtons, callback)
  }

  public wireOperatorButtons(callback: Callback): void {
    this.wireButtons(this.operatorButtons, callback)
  }

  public wireUndoButton(callback: Callback): void {
    this.wireButtons([this.undoButton], callback)
  }

  public reset(numbers: number[]): void {
    this.numbersHistory = []
    this.setNumberButtons(numbers)
    this.enableOperatorButtons()
    this.resetSelectedButtons()
    this.updateUndoButton()
    this.setDeadEnd(false)
    this.setCalculating(false)
  }

  private setNumberButtons(numbers: number[]): void {
    this.numberButtons.forEach((button, column) => {
      const value = numbers[column]!
      button.hide(isNaN(value))
      button.disable(false)
      button.setText(isNaN(value) ? '' : String(value))
    })
  }

  private enableOperatorButtons(): void {
    this.operatorButtons.forEach(button => {
      button.disable(false)
    })
  }

  private updateUndoButton(): void {
    this.undoButton.hide(this.numbersHistory.length === 0)
  }

  public currentNumbers(): number[] {
    return this.numberButtons.map(button => this.getNumber(button))
  }

  public pushCurrentNumbers(): void {
    this.numbersHistory.push(this.currentNumbers())
    this.updateUndoButton()
  }

  public restorePreviousNumbers(): void {
    const numbers = this.numbersHistory.pop()!
    this.setNumberButtons(numbers)
    this.resetSelectedButtons()
    this.setDeadEnd(false)
    this.updateUndoButton()
  }

  public isFirstSelectedNumberButton(button: Button|null): boolean {
    return this.firstSelectedNumberButton === button
  }

  public isSelectedOperatorButton(button: Button|null): boolean {
    return this.selectedOperatorButton === button
  }

  public isSecondSelectedNumberButton(button: Button|null): boolean {
    return this.secondSelectedNumberButton === button
  }

  public setFirstSelectedNumberButton(button: Button|null): void {
    this.firstSelectedNumberButton?.select(false)
    this.firstSelectedNumberButton = button
    this.firstSelectedNumberButton?.select(true)
  }

  public setSelectedOperatorButton(button: Button|null): void {
    if (button !== null && this.isFirstSelectedNumberButton(null))
      return
    this.selectedOperatorButton?.select(false)
    this.selectedOperatorButton = button
    this.selectedOperatorButton?.select(true)
  }

  public setSecondSelectedNumberButton(button: Button|null): void {
    this.secondSelectedNumberButton?.select(false)
    this.secondSelectedNumberButton = button
    this.secondSelectedNumberButton?.select(true)
  }

  public setSelectedNumberButton(button: Button|null): void {
    if (this.isFirstSelectedNumberButton(button)) {
      this.setFirstSelectedNumberButton(null)
      this.setSelectedOperatorButton(null)
      return
    }
    if (this.isFirstSelectedNumberButton(null) || this.isSelectedOperatorButton(null)) {
      this.setFirstSelectedNumberButton(button)
      return
    }
    this.setSecondSelectedNumberButton(button)
  }

  public resetSelectedButtons() {
    this.setFirstSelectedNumberButton(null)
    this.setSecondSelectedNumberButton(null)
    this.setSelectedOperatorButton(null)
  }

  private getNumber(button: Button|null): number {
    if (button === null)
      return NaN
    return parseInt(button.getText())
  }

  public firstSelectedNumber(): number {
    return this.getNumber(this.firstSelectedNumberButton)
  }

  public selectedOperatorSymbol(): string {
    return this.selectedOperatorButton?.getText() || ''
  }

  public secondSelectedNumber(): number {
    return this.getNumber(this.secondSelectedNumberButton)
  }

  public hideFirstSelectedNumberButton(): void {
    this.firstSelectedNumberButton?.setText('')
    this.firstSelectedNumberButton?.hide(true)
  }

  public setSecondSelectedNumberButtonText(text: string): void {
    this.secondSelectedNumberButton?.setText(text)
  }

  public processCalculationResult(result: number): void {
    this.setSecondSelectedNumberButtonText(String(result))
    this.hideFirstSelectedNumberButton()
    const oldSecondSelectedNumberButton = this.secondSelectedNumberButton
    this.resetSelectedButtons()
    this.setFirstSelectedNumberButton(oldSecondSelectedNumberButton)
  }

  public setDeadEnd(isDeadEnd: boolean): void {
    this.numberButtons.forEach(button => button.disable(isDeadEnd))
    this.operatorButtons.forEach(button => button.hide(isDeadEnd))
  }

  public setCalculating(isCalculating: boolean): void {
    this.allButtons.forEach(button => button.disable(isCalculating))
  }
}
