// ============================================================
// Hangslot24 – Game Logic (SVG-based)
// ============================================================

// ============================================================
// Constants – SVG layout (must match index.html viewBox)
// ============================================================

/** Button size in SVG units */
const BUTTON_SIZE = 60
/** Half-size of a button (buttons are 60×60, so half = 30) */
const BUTTON_HALF_SIZE = BUTTON_SIZE / 2
/** X-centers of the 4 button columns (in SVG units) */
const BUTTON_X = [75, 145, 215, 285]
/** Y-center of number button row */
const NUMBER_BUTTON_Y = 207
/** Y-center of operator button row */
const OPERATOR_BUTTON_Y = 277
/** Y-center of undo button row */
const UNDO_BUTTON_Y = 347

// ============================================================
// Types
// ============================================================

type NumberCard = {
  id: string
  value: number
  column: number
  element: SVGGElement
}

type OperatorCard = {
  id: string
  name: OperatorName
  label: string
  column: number
  element: SVGGElement
}

interface HistoryEntry {
  numberCards: NumberCard[]
}

type OperatorName = 'add' | 'subtract' | 'multiply' | 'divide'

// ============================================================
// Helpers
// ============================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate 4 random digits (1–9) that have at least one solution reaching 24.
 */
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
      const validResults = results.filter(result => result !== null)
      return validResults.some(result => hasSolution([result, ...otherNumbers]))
    }
  }
  return false
}

function add(a: number, b: number): number {
  return a + b
}

function subtract(a: number, b: number): number | null {
  return a < b ? null : a - b
}

function multiply(a: number, b: number): number {
  return a * b
}

function divide(a: number, b: number): number | null {
  return b === 0 || a % b !== 0 ? null : a / b
}

// ============================================================
// SVG helpers
// ============================================================

const SVG_NS = 'http://www.w3.org/2000/svg'

function newSvgElement(tag: string): SVGElement {
  return document.createElementNS(SVG_NS, tag)
}

function getSvgElement(id: string): SVGElement {
  return document.getElementById(id) as unknown as SVGElement
}

/**
 * Build a button SVG <g> element.
 * The transform places the center of the button at (cx, cy) in SVG coords.
 */
function makeSvgButton(label: string, cx: number, cy: number, extraClass: string): SVGGElement {
  const g = newSvgElement('g') as SVGGElement
  g.setAttribute('class', extraClass)
  g.setAttribute('transform', `translate(${cx},${cy})`)

  const rectangle = newSvgElement('rect') as SVGRectElement
  rectangle.setAttribute('x', String(-BUTTON_HALF_SIZE))
  rectangle.setAttribute('y', String(-BUTTON_HALF_SIZE))
  rectangle.setAttribute('width', String(BUTTON_SIZE))
  rectangle.setAttribute('height', String(BUTTON_SIZE))
  rectangle.setAttribute('rx', '10')
  rectangle.setAttribute('fill', '#eaedf0')

  const hoverOverlay = newSvgElement('rect') as SVGRectElement
  hoverOverlay.setAttribute('x', String(-BUTTON_HALF_SIZE))
  hoverOverlay.setAttribute('y', String(-BUTTON_HALF_SIZE))
  hoverOverlay.setAttribute('width', String(BUTTON_SIZE))
  hoverOverlay.setAttribute('height', String(BUTTON_SIZE))
  hoverOverlay.setAttribute('rx', '10')
  hoverOverlay.setAttribute('fill', '#c8cdd6')
  hoverOverlay.setAttribute('opacity', '0')
  hoverOverlay.setAttribute('class', 'btn-hover-overlay')

  const text = newSvgElement('text') as SVGTextElement
  text.setAttribute('x', '0')
  text.setAttribute('y', '0')
  text.setAttribute('dominant-baseline', 'central')
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('class', 'btn-label')
  text.textContent = label

  g.appendChild(rectangle)
  g.appendChild(hoverOverlay)
  g.appendChild(text)
  return g
}

// ============================================================
// Game state
// ============================================================

let cards: NumberCard[] = []
let operators: OperatorCard[] = []
let firstNumberCardId: string | null = null
let selectedOperator: OperatorName | null = null
let selectedOperatorElement: SVGGElement | null = null
let moveHistory: HistoryEntry[] = []
let nextId = 0
let isAnimating = false
let isGameOver = false

// ============================================================
// UI state updates
// ============================================================

function updateSelectedStates(): void {
  cards.forEach(card =>
    card.element.classList.toggle('selected', card.id === firstNumberCardId)
  )

  operators.forEach(operator =>
    operator.element.classList.toggle('selected', operator.name === selectedOperator)
  )
}

function updateUndoButton(): void {
  const button = getSvgElement('undoBtn')
  button.classList.toggle('disabled', moveHistory.length === 0)
}

function updateOperatorButtons(): void {
  document.querySelectorAll<SVGGElement>('.op-btn-svg').forEach(button =>
    button.classList.toggle('disabled', isGameOver)
  )
}

function updateNumberButtons(): void {
  cards.forEach(card =>
    card.element.classList.toggle('disabled', isGameOver)
  )
}

// ============================================================
// Event Handlers
// ============================================================

function onNumberClick(id: string): void {
  if (isAnimating || isGameOver)
    return

  if (firstNumberCardId === null) {
    firstNumberCardId = id
    selectedOperator = null
    selectedOperatorElement = null
    updateSelectedStates()
    return
  }

  if (firstNumberCardId === id && selectedOperator === null) {
    firstNumberCardId = null
    updateSelectedStates()
    return
  }

  if (selectedOperator === null) {
    firstNumberCardId = id
    updateSelectedStates()
    return
  }

  // Second card clicked: perform operation
  const secondNumberCardId = id
  const firstCard = cards.find(c => c.id === firstNumberCardId)
  const secondCard = cards.find(c => c.id === secondNumberCardId)

  if (!firstCard || !secondCard || firstCard.id === secondCard.id)
    return

  const operators = { add, subtract, multiply, divide }
  const result = operators[selectedOperator](firstCard.value, secondCard.value)

  if (result === null) {
    // Invalid: clear selection silently
    firstNumberCardId = null
    selectedOperator = null
    selectedOperatorElement = null
    updateSelectedStates()
    return
  }

  // Briefly show the third card as selected before animating
  secondCard.element.classList.add('selected')

  // Save history - create deep copies of card data
  moveHistory.push({
    numberCards: cards.map(c => ({
      id: c.id,
      value: c.value,
      column: c.column,
      element: c.element.cloneNode(true) as SVGGElement
    })),
  })

  performMergeAnimation(firstCard, secondCard, result, selectedOperatorElement)
}

function onOperatorClick(id: string): void {
  if (isAnimating || isGameOver || firstNumberCardId === null)
    return
  
  const operator = operators.find(op => op.id === id)
  if (!operator)
    return
  
  selectedOperator = operator.name
  selectedOperatorElement = operator.element
  updateSelectedStates()
}

function undoCardButtons(restoredCards: NumberCard[]): void {
  const group = getSvgElement('numberGroup')
  group.replaceChildren()

  restoredCards.forEach(card => {
    // Restore the SVG element's transform attribute
    card.element.setAttribute('transform', `translate(${BUTTON_X[card.column]},${NUMBER_BUTTON_Y})`)
    // Remove any CSS transform that might have been applied during animation
    card.element.style.transform = ''
    card.element.style.opacity = '1'
    // Remove 'selected' class that might have been added during animation
    card.element.classList.remove('selected')
    // Re-attach event listener to the cloned element
    card.element.addEventListener('click', () => onNumberClick(card.id))
    group.appendChild(card.element)
  })
}

function onUndo(): void {
  if (isAnimating)
    return
  if (moveHistory.length === 0)
    return

  const prev = moveHistory.pop()!

  // Restore cards by reusing existing SVG elements
  cards = prev.numberCards
  undoCardButtons(cards)

  firstNumberCardId = null
  selectedOperator = null
  selectedOperatorElement = null
  isGameOver = false
  updateSelectedStates()
  updateUndoButton()
  updateOperatorButtons()
  updateNumberButtons()
}

// ============================================================
// Merge Animation
//
// Spec: "een kopie van de bewerking-knop beweegt over de 1ste getal-knop
//        en tegelijkertijd beweegt de 2de getal-knop over (niet onder) de bewerking-knop
//        die dus tegelijkertijd over de 1ste getal-knop beweegt"
// Both movements happen simultaneously in 1 second:
//   - op clone slides from op position → firstCard position
//   - secondCard slides from its own position → firstCard position (over the moving op clone)
// Phase 2 (fade out, 220ms):
//   - secondCard and opClone fade out
// Then: update firstCard value, clean up
//
// CSS transitions do NOT apply to SVG presentation attributes (setAttribute('transform',...)).
// We use the Web Animations API (element.animate()) which works correctly on SVG elements.
// ============================================================

function performMergeAnimation(
  firstCard: NumberCard,
  secondCard: NumberCard,
  result: number,
  opElRef: SVGGElement | null
): void {
  isAnimating = true

  const svg = getSvgElement('padlock')

  // Positions
  const firstCX = BUTTON_X[firstCard.column]
  const secondCX = BUTTON_X[secondCard.column]

  // Operator button center
  let opCX = firstCX
  const opCY = OPERATOR_BUTTON_Y

  const opEl = opElRef ?? document.querySelector<SVGGElement>(`.op-btn-svg[data-op="${selectedOperator}"]`)
  if (opEl) {
    const t = opEl.getAttribute('transform') || ''
    const m = t.match(/translate\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/)
    if (m)
      opCX = parseFloat(m[1]!)
  }

  // ── Create a clone of the op button that will animate ──
  // Use CSS transform (not SVG attribute) so Web Animations API works.
  // The clone is visually marked (selected state). The original op button
  // loses its selected marking immediately.
  let opClone: SVGGElement | null = null
  if (opEl) {
    opClone = opEl.cloneNode(true) as SVGGElement
    opClone.classList.remove('disabled', 'op-btn-svg')
    // Ensure clone shows selected state
    opClone.classList.add('op-clone', 'selected')
    opClone.style.pointerEvents = 'none'
    // Position via CSS transform, remove SVG attribute to avoid conflicts
    opClone.removeAttribute('transform')
    opClone.style.transform = `translate(${opCX}px, ${opCY}px)`
    svg.appendChild(opClone)

    // Remove selected marking from the original op button immediately
    opEl.classList.remove('selected')
  }

  // ── Re-parent secondCard to svg root so it renders on top of opClone ──
  // Switch from SVG attribute to CSS transform for the Web Animations API.
  secondCard.element.removeAttribute('transform')
  secondCard.element.style.transform = `translate(${secondCX}px, ${NUMBER_BUTTON_Y}px)`
  svg.appendChild(secondCard.element)

  const moveDuration = 1000
  const moveEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'

  // ── Animate op clone: op position → firstCard position ──
  if (opClone)
    opClone.animate(
      [
        { transform: `translate(${opCX}px, ${opCY}px)` },
        { transform: `translate(${firstCX}px, ${NUMBER_BUTTON_Y}px)` },
      ],
      { duration: moveDuration, easing: moveEasing, fill: 'forwards' }
    )

  // ── Animate secondCard: its position → firstCard position (over the moving op clone) ──
  const secondAnim = secondCard.element.animate(
    [
      { transform: `translate(${secondCX}px, ${NUMBER_BUTTON_Y}px)` },
      { transform: `translate(${firstCX}px, ${NUMBER_BUTTON_Y}px)` },
    ],
    { duration: moveDuration, easing: moveEasing, fill: 'forwards' }
  )

  secondAnim.onfinish = () => {
    // ── Phase 2: fade out secondCard and opClone ──
    const fadeDuration = 220
    const fadeEasing = 'ease'

    if (opClone)
      opClone.animate(
        [{ opacity: '1' }, { opacity: '0' }],
        { duration: fadeDuration, easing: fadeEasing, fill: 'forwards' }
      )

    const fadeAnim = secondCard.element.animate(
      [{ opacity: '1' }, { opacity: '0' }],
      { duration: fadeDuration, easing: fadeEasing, fill: 'forwards' }
    )

    fadeAnim.onfinish = () => {
      // ── Clean up ──
      if (opClone && opClone.parentNode)
        opClone.parentNode.removeChild(opClone)
      if (secondCard.element.parentNode)
        secondCard.element.parentNode.removeChild(secondCard.element)
      cards = cards.filter(c => c.id !== secondCard.id)

      // Update firstCard value; make sure it stays at its correct position
      firstCard.value = result
      const txt = firstCard.element.querySelector('text')
      if (txt)
        txt.textContent = String(result)

      // Re-attach remaining cards to the number group and restore their transforms
      const group = getSvgElement('numberGroup')
      cards.forEach(card => {
        // Ensure the card has the correct transform attribute
        card.element.setAttribute('transform', `translate(${BUTTON_X[card.column]},${NUMBER_BUTTON_Y})`)
        // Clear any CSS transforms from animation
        card.element.style.transform = ''
        // Only append if not already in the group
        if (card.element.parentNode !== group)
          group.appendChild(card.element)
      })

      // Flash merging class
      firstCard.element.classList.add('merging')
      setTimeout(() => firstCard.element.classList.remove('merging'), 420)

      firstNumberCardId = null
      selectedOperator = null
      selectedOperatorElement = null
      updateSelectedStates()
      updateUndoButton()

      isAnimating = false

      // Check win condition
      if (cards.length === 1)
        if (cards[0]!.value === 24)
          setTimeout(() => {
            openPadlock()
            // After 3s: close padlock, then restart after close animation
            setTimeout(() => {
              closePadlock()
              setTimeout(() => {
                startGame()
              }, 700)
            }, 3000)
          }, 400)
        else {
          // Not 24: disable number and op buttons, wait for undo
          isGameOver = true
          updateOperatorButtons()
          updateNumberButtons()
        }
    }
  }
}

// ============================================================
// Padlock open/close animation
// ============================================================

function openPadlock(): void {
  document.getElementById('padlock')?.classList.add('open')
}

function closePadlock(): void {
  document.getElementById('padlock')?.classList.remove('open')
}

// ============================================================
// Start / Init
// ============================================================

function startGame(): void {
  nextId = 0
  moveHistory = []
  firstNumberCardId = null
  selectedOperator = null
  selectedOperatorElement = null
  isGameOver = false

  const numbers = generatePuzzle()
  createCardButtons(numbers)
  createOperatorButtons()
  createUndoButton()

  updateNumberButtons()
  updateOperatorButtons()
  updateUndoButton()

  updateSelectedStates()
}

function createCardButtons(numbers: number[]) {
  cards = numbers.map((num, column) => {
    const g = makeSvgButton(String(num), BUTTON_X[column]!, NUMBER_BUTTON_Y, 'num-btn-svg')
    g.id = `number-column-${column}`
    g.addEventListener('click', () => onNumberClick(g.id))

    return {
      id: g.id,
      value: num,
      column: column,
      element: g,
    }
  })
  getSvgElement('numberGroup').replaceChildren(...cards.map(card => card.element))
}

function createOperatorButtons() {
  const ops: [string, OperatorName][] = [
    ['+', 'add'],
    ['-', 'subtract'],
    ['×', 'multiply'],
    ['÷', 'divide']
  ]
  operators = ops.map(([label, operatorName], column) => {
    const g = makeSvgButton(label, BUTTON_X[column]!, OPERATOR_BUTTON_Y, 'op-btn-svg')
    g.id = `operator-column-${column}`
    g.addEventListener('click', () => onOperatorClick(g.id))

    return {
      id: g.id,
      name: operatorName,
      label: label,
      column: column,
      element: g,
    }
  })
  getSvgElement('operatorGroup').replaceChildren(...operators.map(card => card.element))
}

function createUndoButton() {
  const g = makeSvgButton('←', BUTTON_X[0]!, UNDO_BUTTON_Y, 'undo-btn-svg')
  g.id = 'undoBtn'
  g.addEventListener('click', onUndo)
  getSvgElement('undoGroup').replaceChildren(g)
}

function init(): void {
  startGame()
}

// Bootstrap
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init)
else
  init()
