/*

# **Definitions (used in all levels)**

For a given set of 4 numbers:

* **Valid operation**: +, −, ×, ÷ where:

  * Subtraction is only allowed when the result is **non-negative** (a − b only when a ≥ b)
  * Division is only allowed when the result is a **positive integer** (a ÷ b only when b divides a exactly)
* **Solution path**: a sequence of 3 operations that evaluates to 24
* **Viable path count**: the number of distinct solution paths, counted by tracking unique intermediate multisets — paths that pass through the same intermediate values are counted once

---

# **Level 1 — Direct**

**Criterion:** `viable path count ≥ 7`

Many different sequences of operations lead to 24. The puzzle has a high branching factor: multiple starting operations are productive, and there are several independent routes to the answer.

---

# **Level 2 — Constructive**

**Criterion:** `4 ≤ viable path count ≤ 6`

A moderate number of solution paths exist. The puzzle requires deliberate construction — not every starting operation is productive, but several valid routes remain available.

---

# **Level 3 — Constrained**

**Criterion:** `1 ≤ viable path count ≤ 3`

Very few solution paths exist. The puzzle has a narrow search space: most operation sequences are dead ends, and the correct approach requires precise ordering.

---

# **Level 0 — Unsolvable**

**Criterion:** `viable path count = 0`

No sequence of valid operations produces 24 from these four numbers.

---

# **Summary Table**

| Level | Name        | Viable Paths | Difficulty         |
| ----- | ----------- | ------------ | ------------------ |
| 1     | Direct      | ≥ 7          | Easy               |
| 2     | Constructive| 4–6          | Medium             |
| 3     | Constrained | 1–3          | Hard               |
| 0     | Unsolvable  | 0            | —                  |

*/


import * as fs from 'fs'

// Allowed operations
const operations = [
  (a: number, b: number) => a + b,
  (a: number, b: number) => a >= b ? a - b : NaN,
  (a: number, b: number) => a * b,
  (a: number, b: number) => (b !== 0 && a % b === 0 ? a / b : NaN),
]

// Try all expression trees and count solution paths
function getLevel(numbers: number[]): number {
  let solutionCount = 0
  const seenStates = new Set<string>()

  function traverseTree(numbers: number[]) {
    if (numbers.length === 1) {
      if (numbers[0] === 24)
        solutionCount++
      return
    }

    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const remainingNumbers = numbers.filter((_, index) => index !== i && index !== j)

        for (const operation of operations) {
          // Try operation in both directions
          const result = operation(numbers[i]!, numbers[j]!) || operation(numbers[j]!, numbers[i]!)
          if (isNaN(result))
            continue
          const newNumbers = [...remainingNumbers, result].sort((a, b) => a - b)
          const stateKey = newNumbers.join(',')
          if (!seenStates.has(stateKey)) {
            if (newNumbers.length > 1)
              seenStates.add(stateKey)
            traverseTree(newNumbers)
          }
        }
      }
    }
  }

  traverseTree(numbers)

  // Level 0 — Unsolvable
  if (solutionCount <= 0)
    return 0

  // Level 3 — Constrained: low number of viable solution paths
  if (solutionCount <= 2)
    return 3

  // Level 2 — Constructive: moderate number of viable solution paths
  if (solutionCount <= 4)
    return 2

  // Level 1 — Direct: high number of viable solution paths
  return 1
}

// Generate combinations (with repetition, sorted to avoid duplicates)
function getCombinations(): number[][] {
  const combinations: number[][] = []
  for (let a = 1; a <= 9; a++)
    for (let b = a; b <= 9; b++)
      for (let c = b; c <= 9; c++)
        for (let d = c; d <= 9; d++)
          combinations.push([a, b, c, d])
  return combinations
}

// Main
function main() {
  const combinations = getCombinations()

  const json = combinations.map(numbers => {
    const level = getLevel(numbers)
    return { numbers, level }
  })

  const total = json.reduce((total, { level }) => {
    total[level]!++
    return total
  }, [0, 0, 0, 0])

  console.log(total, json.length)
  fs.writeFileSync('results.json', JSON.stringify(json, null, 2))
}

main()
