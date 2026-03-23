import { Button } from './button.js'
import { Game } from './game.js'
import { State } from './state.js'

export class Padlock {
  private game: Game
  private state: State

  constructor() {
    this.game = new Game()
    this.state = new State()
    this.state.wireNumberButtons((button: Button) => this.onClickNumberButton(button))
    this.state.wireOperatorButtons((button: Button) => this.onClickOperatorButton(button))
    this.state.wireUndoButton((button: Button) => this.onClickUndoButton(button))
    this.start()
  }

  private start(): void {
    const numbers = this.game.generateNumbers()
    this.state.reset(numbers)
  }

  private onClickUndoButton(_button: Button): void {
    this.state.restorePreviousNumbers()
  }

  private onClickOperatorButton(button: Button): void {
    this.state.setSelectedOperatorButton(button)
  }

  private onClickNumberButton(button: Button): void {
    this.state.setSelectedNumberButton(button)
    if (this.state.isSecondSelectedNumberButton(button))
      this.performCalculation()
  }

  private performCalculation(): void {
    const firstNumber = this.state.firstSelectedNumber()
    const operatorSymbol = this.state.selectedOperatorSymbol()
    const secondNumber = this.state.secondSelectedNumber()
    const result = this.game.performCalculation(firstNumber, operatorSymbol, secondNumber)
    if (isNaN(result)) {
      this.state.resetSelectedButtons()
      return
    }

    this.state.setCalculating(true)
    this.state.pushCurrentNumbers()
    this.state.processCalculationResult(result)

    const numbers = this.state.currentNumbers().filter(number => !isNaN(number))
    if (this.game.checkGameOver(numbers)) {
      this.openAndClose()
      return
    }
    this.state.setCalculating(false)
    if (this.game.checkDeadEnd(numbers))
      this.state.setDeadEnd(true)
  }

  private openAndClose(): void {
    const shackle = document.querySelector('#shackle') as SVGGElement
    shackle.classList.add('open')
    setTimeout(() => {
      shackle.classList.remove('open')
      setTimeout(() => this.start(), 1000)
    }, 2000)
  }
}
