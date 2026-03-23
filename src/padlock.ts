import { Button } from './button.js'
import { Game } from './game.js'

export type Index = -1 | 0 | 1 | 2 | 3

export class Padlock {
  private readonly numberButtons = Array.from(document.querySelectorAll<SVGElement>('.number-button')).map(el => new Button(el))
  private readonly operatorButtons = Array.from(document.querySelectorAll<SVGElement>('.operator-button')).map(el => new Button(el))
  private readonly undoButtons = Array.from(document.querySelectorAll<SVGElement>('.undo-button')).map(el => new Button(el))
  private readonly game = new Game()

  // State
  private currentNumbers: number[] = []
  private firstSelectedNumberIndex: Index = -1
  private secondSelectedNumberIndex: Index = -1
  private selectedOperatorIndex: Index = -1
  private numbersHistory: number[][] = []
  private isDeadEnd: boolean = false
  private isGameOver: boolean = false

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
    this.currentNumbers = this.game.generateNumbers()
    this.firstSelectedNumberIndex = -1
    this.secondSelectedNumberIndex = -1
    this.selectedOperatorIndex = -1
    this.numbersHistory = []
    this.isDeadEnd = false
    this.isGameOver = false
    this.showState()
  }

  private showState(): void {
    this.numberButtons.forEach((button, index) => {
      const value = this.currentNumbers[index]!
      button.setText(isNaN(value) ? '' : String(value))
      button.disable(this.isDeadEnd || this.isGameOver || isNaN(value))
      button.select(this.firstSelectedNumberIndex === index || this.secondSelectedNumberIndex === index)
    })
    this.operatorButtons.forEach((button, index) => {
      button.disable(this.isDeadEnd || this.isGameOver)
      button.select(this.selectedOperatorIndex === index)
    })
    this.undoButtons.forEach(button => {
      button.disable(this.isGameOver || this.numbersHistory.length === 0)
    })
  }

  private onClickUndoButton(_index: Index): void {
    this.currentNumbers = this.numbersHistory.pop()!
    this.firstSelectedNumberIndex = -1
    this.secondSelectedNumberIndex = -1
    this.selectedOperatorIndex = -1
    this.isDeadEnd = false
    this.showState()
  }

  private onClickOperatorButton(index: Index): void {
    if (this.firstSelectedNumberIndex === -1)
      return
    this.selectedOperatorIndex = index
    this.showState()
  }

  private onClickNumberButton(index: Index): void {
    if (this.firstSelectedNumberIndex === index) {
      this.firstSelectedNumberIndex = -1
      this.selectedOperatorIndex = -1
      this.showState()
      return
    }
    if (this.firstSelectedNumberIndex === -1 || this.selectedOperatorIndex === -1) {
      this.firstSelectedNumberIndex = index
      this.showState()
      return
    }
    this.secondSelectedNumberIndex = index
    this.showState()

    const firstNumber = this.currentNumbers[this.firstSelectedNumberIndex]!
    const secondNumber = this.currentNumbers[this.secondSelectedNumberIndex]!
    const result = this.game.performCalculation(firstNumber, this.selectedOperatorIndex, secondNumber)
    if (isNaN(result)) {
      this.firstSelectedNumberIndex = -1
      this.secondSelectedNumberIndex = -1
      this.selectedOperatorIndex = -1
      this.showState()
      return
    }

    this.numbersHistory.push([...this.currentNumbers]) // push a static copy of the current numbers
    this.currentNumbers[this.firstSelectedNumberIndex] = NaN
    this.currentNumbers[this.secondSelectedNumberIndex] = result
    this.selectedOperatorIndex = -1
    this.firstSelectedNumberIndex = this.secondSelectedNumberIndex
    this.secondSelectedNumberIndex = -1
    this.showState()
    const validNumbers = this.currentNumbers.filter(number => !isNaN(number))
    if (this.game.checkDeadEnd(validNumbers)) {
      this.isDeadEnd = true
      this.showState()
      return
    }
    if (this.game.checkGameOver(validNumbers)) {
      this.isGameOver = true
      this.showState()
      this.openAndClosePadlock()
      return
    }
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