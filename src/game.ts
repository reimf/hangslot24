// ============================================================
// Hangslot24 – Game Logic (SVG-based)
// ============================================================

// ============================================================
// Constants – SVG layout (must match index.html viewBox)
// ============================================================

/** X-centers of the 4 button columns (in SVG units) */
const COL_X = [75, 145, 215, 285]
/** Y-center of number button row */
const ROW1_Y = 207
/** Y-center of operator button row */
const ROW2_Y = 277
/** Half-size of a button (buttons are 58×58, so half = 29) */
const BTN_HALF = 29

// ============================================================
// Types
// ============================================================

interface NumberCard {
  id: number
  value: number
  el: SVGGElement
  /** Logical column index (0-3) */
  slotIndex: number
}

interface HistoryEntry {
  cards: Array<{ id: number; value: number; slotIndex: number }>
  removedId: number
}

type OpName = 'add' | 'subtract' | 'multiply' | 'divide'

// ============================================================
// Helpers
// ============================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate 4 random digits (1–9) that have at least one solution reaching 24.
 * Falls back to a known good puzzle after a number of failed attempts.
 */
function generatePuzzle(): number[] {
  const knownPuzzles: number[][] = [
    [1, 2, 3, 4],
    [1, 1, 4, 6],
    [2, 3, 4, 4],
    [2, 4, 8, 8],
    [1, 3, 4, 6],
    [1, 4, 5, 6],
    [1, 2, 6, 9],
    [3, 3, 6, 8],
    [2, 2, 7, 8],
    [1, 2, 7, 8],
    [3, 4, 6, 8],
    [1, 6, 6, 8],
    [4, 4, 6, 6],
  ]

  for (let attempt = 0; attempt < 500; attempt++) {
    const nums = [
      randomInt(1, 9),
      randomInt(1, 9),
      randomInt(1, 9),
      randomInt(1, 9),
    ]
    if (hasSolution(nums))
      return nums
  }

  return knownPuzzles[randomInt(0, knownPuzzles.length - 1)]!.slice()
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
      const validResults = results.filter(result => !Number.isNaN(result))
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
// SVG helpers
// ============================================================

const SVG_NS = 'http://www.w3.org/2000/svg'

function svgEl(tag: string): SVGElement {
  return document.createElementNS(SVG_NS, tag)
}

function getSvgEl<T extends Element>(id: string): T {
  return document.getElementById(id) as unknown as T
}

/**
 * Build a button SVG <g> element.
 * The transform places the center of the button at (cx, cy) in SVG coords.
 */
function makeSvgButton(label: string, cx: number, cy: number, extraClass: string): SVGGElement {
  const g = svgEl('g') as SVGGElement
  g.setAttribute('class', extraClass)
  g.setAttribute('transform', `translate(${cx},${cy})`)

  const rect = svgEl('rect') as SVGRectElement
  rect.setAttribute('x', String(-BTN_HALF))
  rect.setAttribute('y', String(-BTN_HALF))
  rect.setAttribute('width', '58')
  rect.setAttribute('height', '58')
  rect.setAttribute('rx', '10')
  rect.setAttribute('fill', '#eaedf0')

  const hoverOverlay = svgEl('rect') as SVGRectElement
  hoverOverlay.setAttribute('x', String(-BTN_HALF))
  hoverOverlay.setAttribute('y', String(-BTN_HALF))
  hoverOverlay.setAttribute('width', '58')
  hoverOverlay.setAttribute('height', '58')
  hoverOverlay.setAttribute('rx', '10')
  hoverOverlay.setAttribute('fill', '#c8cdd6')
  hoverOverlay.setAttribute('opacity', '0')
  hoverOverlay.setAttribute('class', 'btn-hover-overlay')

  const text = svgEl('text') as SVGTextElement
  text.setAttribute('x', '0')
  text.setAttribute('y', '0')
  text.setAttribute('dominant-baseline', 'central')
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('class', 'btn-label')
  text.textContent = label

  g.appendChild(rect)
  g.appendChild(hoverOverlay)
  g.appendChild(text)
  return g
}

// ============================================================
// Game state
// ============================================================

let cards: NumberCard[] = []
let selectedCardId: number | null = null
let selectedOp: OpName | null = null
let selectedOpEl: SVGGElement | null = null
let moveHistory: HistoryEntry[] = []
let nextId = 0
let animating = false
let gameOver = false

// ============================================================
// UI state updates
// ============================================================

function updateSelectedStates(): void {
  cards.forEach(card =>
    card.el.classList.toggle('selected', card.id === selectedCardId)
  )

  document.querySelectorAll<SVGGElement>('.op-btn-svg').forEach(btn =>
    btn.classList.toggle('selected', btn.dataset['op'] === selectedOp)
  )
}

function updateUndoBtn(): void {
  const btn = getSvgEl<SVGGElement>('undoBtn')
  btn.classList.toggle('disabled', moveHistory.length === 0)
}

function updateOpButtons(): void {
  document.querySelectorAll<SVGGElement>('.op-btn-svg').forEach(btn =>
    btn.classList.toggle('disabled', gameOver)
  )
}

function updateNumButtons(): void {
  cards.forEach(card =>
    card.el.classList.toggle('disabled', gameOver)
  )
}

// ============================================================
// Event Handlers
// ============================================================

function onNumberClick(id: number): void {
  if (animating || gameOver)
    return

  if (selectedCardId === null) {
    selectedCardId = id
    selectedOp = null
    selectedOpEl = null
    updateSelectedStates()
    return
  }

  if (selectedCardId === id && selectedOp === null) {
    selectedCardId = null
    updateSelectedStates()
    return
  }

  if (selectedOp === null) {
    selectedCardId = id
    updateSelectedStates()
    return
  }

  // Second card clicked: perform operation
  const firstCard = cards.find(c => c.id === selectedCardId)
  const secondCard = cards.find(c => c.id === id)

  if (!firstCard || !secondCard)
    return
  if (firstCard.id === secondCard.id)
    return

  const ops = { add, subtract, multiply, divide }
  const result = ops[selectedOp](firstCard.value, secondCard.value)

  if (Number.isNaN(result)) {
    // Invalid: clear selection silently
    selectedCardId = null
    selectedOp = null
    selectedOpEl = null
    updateSelectedStates()
    return
  }

  // Briefly show the third card as selected before animating
  secondCard.el.classList.add('selected')

  // Save history
  moveHistory.push({
    cards: cards.map(c => ({ id: c.id, value: c.value, slotIndex: c.slotIndex })),
    removedId: secondCard.id,
  })

  performMergeAnimation(firstCard, secondCard, result, selectedOpEl)
}

function onOpClick(op: OpName, el: SVGGElement): void {
  if (animating || gameOver)
    return

  if (selectedCardId === null)
    return

  selectedOp = op
  selectedOpEl = el
  updateSelectedStates()
}

function onUndo(): void {
  if (animating)
    return
  if (moveHistory.length === 0)
    return

  const prev = moveHistory.pop()!
  const oldCardData = prev.cards

  const group = getSvgEl<SVGGElement>('numberButtonsGroup')
  while (group.firstChild) group.removeChild(group.firstChild)

  cards = oldCardData.map((cd: { id: number; value: number; slotIndex: number }) => {
    const g = makeSvgButton(String(cd.value), COL_X[cd.slotIndex]!, ROW1_Y, 'num-btn-svg')
    g.dataset['id'] = String(cd.id)
    const cardId = cd.id
    g.addEventListener('click', () => onNumberClick(cardId))
    group.appendChild(g)

    return {
      id: cd.id,
      value: cd.value,
      slotIndex: cd.slotIndex,
      el: g,
    }
  })

  selectedCardId = null
  selectedOp = null
  selectedOpEl = null
  gameOver = false
  updateSelectedStates()
  updateUndoBtn()
  updateOpButtons()
  updateNumButtons()
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
  animating = true

  const svg = getSvgEl<SVGGElement>('padlockSvg')

  // Positions
  const firstCX = COL_X[firstCard.slotIndex]
  const secondCX = COL_X[secondCard.slotIndex]

  // Operator button center
  let opCX = firstCX
  const opCY = ROW2_Y

  const opEl = opElRef ?? document.querySelector<SVGGElement>(`.op-btn-svg[data-op="${selectedOp}"]`)
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
  secondCard.el.removeAttribute('transform')
  secondCard.el.style.transform = `translate(${secondCX}px, ${ROW1_Y}px)`
  svg.appendChild(secondCard.el)

  const moveDuration = 1000
  const moveEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'

  // ── Animate op clone: op position → firstCard position ──
  if (opClone)
    opClone.animate(
      [
        { transform: `translate(${opCX}px, ${opCY}px)` },
        { transform: `translate(${firstCX}px, ${ROW1_Y}px)` },
      ],
      { duration: moveDuration, easing: moveEasing, fill: 'forwards' }
    )

  // ── Animate secondCard: its position → firstCard position (over the moving op clone) ──
  const secondAnim = secondCard.el.animate(
    [
      { transform: `translate(${secondCX}px, ${ROW1_Y}px)` },
      { transform: `translate(${firstCX}px, ${ROW1_Y}px)` },
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

    const fadeAnim = secondCard.el.animate(
      [{ opacity: '1' }, { opacity: '0' }],
      { duration: fadeDuration, easing: fadeEasing, fill: 'forwards' }
    )

    fadeAnim.onfinish = () => {
      // ── Clean up ──
      if (opClone && opClone.parentNode)
        opClone.parentNode.removeChild(opClone)
      if (secondCard.el.parentNode)
        secondCard.el.parentNode.removeChild(secondCard.el)
      cards = cards.filter(c => c.id !== secondCard.id)

      // Re-attach remaining cards to the number group
      const group = getSvgEl<SVGGElement>('numberButtonsGroup')
      for (const card of cards) {
        if (card.el.parentNode !== group)
          group.appendChild(card.el)
      }

      // Update firstCard value; make sure it stays at its correct position
      firstCard.value = result
      const txt = firstCard.el.querySelector('text')
      if (txt)
        txt.textContent = String(result)

      // Flash merging class
      firstCard.el.classList.add('merging')
      setTimeout(() => firstCard.el.classList.remove('merging'), 420)

      selectedCardId = null
      selectedOp = null
      selectedOpEl = null
      updateSelectedStates()
      updateUndoBtn()

      animating = false

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
          gameOver = true
          updateOpButtons()
          updateNumButtons()
        }
    }
  }
}

// ============================================================
// Padlock open/close animation
// ============================================================

function openPadlock(): void {
  const svg = document.getElementById('padlockSvg')
  if (svg)
    svg.classList.add('open')
}

function closePadlock(): void {
  const svg = document.getElementById('padlockSvg')
  if (svg)
    svg.classList.remove('open')
}

// ============================================================
// Start / Init
// ============================================================

function startGame(): void {
  const nums = generatePuzzle()
  nextId = 0
  moveHistory = []
  selectedCardId = null
  selectedOp = null
  selectedOpEl = null
  gameOver = false

  const group = getSvgEl<SVGGElement>('numberButtonsGroup')
  while (group.firstChild) group.removeChild(group.firstChild)

  cards = nums.map((n, i) => {
    const g = makeSvgButton(String(n), COL_X[i]!, ROW1_Y, 'num-btn-svg')
    const id = nextId++
    g.dataset['id'] = String(id)
    g.addEventListener('click', () => onNumberClick(id))
    group.appendChild(g)

    return {
      id,
      value: n,
      el: g,
      slotIndex: i,
    }
  })

  updateUndoBtn()
  updateOpButtons()
  updateNumButtons()
  updateSelectedStates()
}

function init(): void {
  // Wire operator buttons
  document.querySelectorAll<SVGGElement>('.op-btn-svg').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.dataset['op'] as OpName | undefined
      if (op)
        onOpClick(op, btn)
    })
  })

  // Wire undo button
  const undoBtn = getSvgEl<SVGGElement>('undoBtn')
  undoBtn.addEventListener('click', onUndo)

  startGame()
}

// Bootstrap
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init)
else
  init()
