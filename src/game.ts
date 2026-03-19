// ============================================================
// Hangslot24 – Game Logic (SVG-based)
// ============================================================

// ============================================================
// Types
// ============================================================

type OperatorName = 'add' | 'subtract' | 'multiply' | 'divide'

// ============================================================
// Helpers
// ============================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePuzzle(): number[] {
  while (true) {
    const numbers = [randomInt(1, 9), randomInt(1, 9), randomInt(1, 9), randomInt(1, 9)]
    if (hasSolution(numbers))
      return numbers
  }
}

function hasSolution(numbers: number[]): boolean {
  if (numbers.length === 1)
    return numbers[0] === 24
  for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      if (i === j)
        continue
      const otherNumbers = numbers.filter((_, index) => index !== i && index !== j)
      const a = numbers[i] as number
      const b = numbers[j] as number
      const operations = [add, subtract, multiply, divide]
      const results = operations.map(operation => operation(a, b))
      const validResults = results.filter(result => !isNaN(result))
      return validResults.some(result => hasSolution([result, ...otherNumbers]))
    }
  }
  return false
}

function add(a: number, b: number): number {
  return a + b
}

function subtract(a: number, b: number): number {
  return a < b ? NaN : a - b
}

function multiply(a: number, b: number): number {
  return a * b
}

function divide(a: number, b: number): number {
  return b === 0 || a % b !== 0 ? NaN : a / b
}

// ============================================================
// Number-button helpers
// ============================================================

function isButtonHidden(button: SVGElement): boolean {
  return button.classList.contains('hidden')
}

function getNumberButtonValue(button: SVGElement): number {
  if (isButtonHidden(button))
    return NaN
  return parseInt(button.querySelector('text')!.textContent!)
}

function setNumberButtonValue(button: SVGElement, value: number): void {
  button.querySelector('text')!.textContent = String(value)
}

function showNumberButton(button: SVGElement, value: number): void {
  setNumberButtonValue(button, value)
  button.classList.remove('selected', 'disabled', 'hidden')
}

function hideNumberButton(button: SVGElement): void {
  button.classList.add('hidden')
}

// ============================================================
// Game state
// ============================================================

const numberButtons: SVGElement[] = Array.from(document.querySelectorAll<SVGElement>('.number-button'))
const operatorButtons: SVGElement[] = Array.from(document.querySelectorAll<SVGElement>('.operator-button'))
const undoButton = document.querySelector<SVGElement>('.undo-button')!
let firstSelectedNumberButton: SVGElement | null = null
let secondSelectedNumberButton: SVGElement | null = null
let selectedOperatorButton: SVGElement | null = null
let moveHistory: number[][] = []
let isCalculating = false
let isDeadEnd = false

// ============================================================

function updateButtonClasses(): void {
  numberButtons.forEach(button => {
    button.classList.toggle('selected', button === firstSelectedNumberButton || button === secondSelectedNumberButton)
    button.classList.toggle('disabled', isDeadEnd)
  })
  operatorButtons.forEach(button => {
    button.classList.toggle('selected', button === selectedOperatorButton)
    button.classList.toggle('disabled', isDeadEnd)
  })
  undoButton.classList.toggle('disabled', moveHistory.length === 0)
}

function onNumberClick(button: SVGElement): void {
  if (isCalculating || isDeadEnd || isButtonHidden(button))
    return

  if (firstSelectedNumberButton === button && selectedOperatorButton === null) {
    firstSelectedNumberButton = null
    updateButtonClasses()
    return
  }

  if (firstSelectedNumberButton === null || selectedOperatorButton === null) {
    firstSelectedNumberButton = button
    updateButtonClasses()
    return
  }

  if (firstSelectedNumberButton === button)
    return

  secondSelectedNumberButton = button
  updateButtonClasses()

  const operatorName = selectedOperatorButton.getAttribute('data-operatorname') as OperatorName
  const operatorFunctions = { add, subtract, multiply, divide }
  const firstValue = getNumberButtonValue(firstSelectedNumberButton)
  const secondValue = getNumberButtonValue(secondSelectedNumberButton)
  const result = operatorFunctions[operatorName](firstValue, secondValue)

  if (isNaN(result)) {
    firstSelectedNumberButton = null
    selectedOperatorButton = null
    secondSelectedNumberButton = null
    updateButtonClasses()
    return
  }

  moveHistory.push(numberButtons.map(getNumberButtonValue))

  isCalculating = true

  // Show full expression on firstNumberButton immediately (e.g. "8+3")
  const firstNumberTextElement = firstSelectedNumberButton.querySelector('text')!
  const operatorText = selectedOperatorButton.querySelector('text')!.textContent
  const secondNumberText = secondSelectedNumberButton.querySelector('text')!.textContent
  firstNumberTextElement.textContent += operatorText + secondNumberText

  hideNumberButton(secondSelectedNumberButton)
  selectedOperatorButton = null
  secondSelectedNumberButton = null
  updateButtonClasses()

  setTimeout(() => {
    setNumberButtonValue(firstSelectedNumberButton!, result)

    isCalculating = false

    checkGameOver()
  }, 1000)
}

function onOperatorClick(button: SVGElement): void {
  if (isCalculating || isDeadEnd || firstSelectedNumberButton === null)
    return

  selectedOperatorButton = button
  updateButtonClasses()
}

function onUndo(): void {
  if (isCalculating || moveHistory.length === 0)
    return

  const prev = moveHistory.pop()!
  numberButtons.forEach((button, column) => {
    const value = prev[column]!
    if (isNaN(value))
      hideNumberButton(button)
    else
      showNumberButton(button, value)
  })

  firstSelectedNumberButton = null
  selectedOperatorButton = null
  isDeadEnd = false
  updateButtonClasses()
}

function checkGameOver(): void {
  const visibleButtons = numberButtons.filter(button => !isButtonHidden(button))
  if (visibleButtons.length !== 1)
    return
  const value = getNumberButtonValue(visibleButtons[0]!)
  if (value !== 24) {
    isDeadEnd = true
    updateButtonClasses()
    return
  }
  openAndClosePadlock()
}

// ============================================================
// Padlock open/close animation
// ============================================================

function openAndClosePadlock(): void {
  const padlock = document.getElementById('padlock')!
  setTimeout(() => {
    padlock.classList.add('open')
    // After 3s: close padlock, then restart after close animation
    setTimeout(() => {
      padlock.classList.remove('open')
      setTimeout(() => startGame(), 700)
    }, 3000)
  }, 400)
}

// ============================================================
// Button initialisation
// Buttons are defined in index.html and live in the DOM permanently.
// game.ts updates their text labels, wires event handlers, and
// shows/hides/dims them as the game state changes.
// ============================================================

/**
 * Wire all buttons once at startup.
 * Handlers reference live game-state arrays so they stay correct
 * across multiple games without re-wiring.
 */
function wireButtons(): void {
  numberButtons.forEach(button =>
    button.addEventListener('click', () => onNumberClick(button))
  )
  operatorButtons.forEach(button =>
    button.addEventListener('click', () => onOperatorClick(button))
  )
  undoButton.addEventListener('click', () => onUndo())
}

/**
 * Reset number buttons for a new game:
 * show all four, set their labels, and build the numberButtons array.
 */
function resetNumberButtons(numbers: number[]): void {
  numberButtons.forEach((button, column) =>
    showNumberButton(button, numbers[column]!)
  )
}

/**
 * Reset operator buttons for a new game: clear state.
 */
function resetOperatorButtons(): void {
  operatorButtons.forEach(button => {
    button.classList.remove('selected', 'disabled')
  })
}

// ============================================================
// Start / Init
// ============================================================

function startGame(): void {
  moveHistory = []
  firstSelectedNumberButton = null
  selectedOperatorButton = null
  secondSelectedNumberButton = null
  isDeadEnd = false

  const numbers = generatePuzzle()
  resetNumberButtons(numbers)
  resetOperatorButtons()

  updateButtonClasses()
}

function init(): void {
  wireButtons()
  startGame()
}

// Bootstrap
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init)
else
  init()
