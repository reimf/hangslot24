/*
# Level 1 — Direct Construction

**Core idea:** Build 24 in one obvious step.

**Start number characteristics**

* Contains a number that is a **factor of 24** (e.g., 3, 4, 6, 8)
* Often includes **duplicates or 1s**
* Sum or product is already close to 24

**Allowed solution patterns**

* ((a + b + c) \times d)
* (a \times b \times c)

**Intermediate traits**

* Only **one intermediate step**
* All intermediates ≤ 24

**Example**

* 1, 2, 3, 4 → ((1+2+3) × 4)

---

# Level 2 — Two-Step Linear Build

**Core idea:** Create a helpful intermediate (like 6, 8, or 12), then scale to 24.

**Start number characteristics**

* No immediate 24-forming combination
* Contains **complementary pairs** (e.g., 3 & 8, 4 & 6)

**Allowed solution patterns**

* ((a + b) × (c + d))
* ((a × b) × (c + d))

**Intermediate traits**

* One intermediate target like **6, 8, or 12**
* Still no branching decisions

**Example**

* 2, 3, 4, 6 → ((2×3) × (4+6))

---

# Level 3 — Ordered Assembly

**Core idea:** The order of operations matters; not all combinations work.

**Start number characteristics**

* No obvious factor pairing
* Numbers are **spread out** (e.g., 2, 5, 7, 8)

**Allowed solution patterns**

* ((a × b + c) × d)
* ((a + b × c) × d)

**Intermediate traits**

* Requires **specific sequencing**
* Intermediate values often **not factors of 24** until the final step

**Example**

* 2, 5, 7, 8 → ((5×2 + 7) × 8 ÷ ?) (must avoid invalid paths and choose correct order)

---

# Level 4 — Constrained Composition

**Core idea:** Only a **few valid operation sequences** work.

**Start number characteristics**

* No 1s, no duplicates
* Weak direct synergy with 24 (e.g., primes or awkward combinations)

**Allowed solution patterns**

* Mixed operations across all four numbers
* Often requires **building toward 12 or 24 indirectly**

**Intermediate traits**

* Several “dead ends” if wrong order is chosen
* Intermediates may temporarily exceed 24 but remain positive integers

**Example**

* 3, 5, 7, 8 → must carefully combine to avoid unusable totals

---

# Level 5 — Tight Constraint / Single Path

**Core idea:** Essentially **one viable solution path** under the rules.

**Start number characteristics**

* No easy factors of 24
* Often includes **multiple primes or near-primes** (5, 7)
* No helpful sums like 6, 8, 12 appear naturally

**Allowed solution patterns**

* Non-obvious grouping like:

  * ((a × b + c) × d)
  * ((a × (b + c)) × d)

**Intermediate traits**

* Requires:

  * Exact intermediate targets (e.g., must hit 3 or 4 first)
  * Careful avoidance of overshooting
* Very low branching tolerance

**Example**

* 3, 5, 7, 7 → only very specific construction yields 24

---

# Summary of Progression

| Level | Key Feature | Player Challenge    |
| ----- | ----------- | ------------------- |
| 1     | Direct      | Recognition         |
| 2     | Two-step    | Simple planning     |
| 3     | Ordered     | Sequencing          |
| 4     | Constrained | Search + pruning    |
| 5     | Single-path | Precision reasoning |

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
function analyzeSolutions(numbers: number[]): { solvable: boolean; solutionCount: number; maxIntermediate: number } {
  let solutionCount = 0
  let maxIntermediate = 0
  const seenStates = new Set<string>()

  function helper(numbers: number[]) {
    if (numbers.length === 1) {
      if (numbers[0] === 24)
        solutionCount++
      return
    }

    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const remainingNumbers = numbers.filter((_, index) => index !== i && index !== j)

        for (const op of operations) {
          // Try operation in both directions
          const result1 = op(numbers[i]!, numbers[j]!)
          if (!isNaN(result1)) {
            maxIntermediate = Math.max(maxIntermediate, result1)

            const newNumbers1 = [...remainingNumbers, result1].sort((a, b) => a - b)
            const stateKey1 = newNumbers1.join(',')

            if (!seenStates.has(stateKey1)) {
              seenStates.add(stateKey1)
              helper(newNumbers1)
            }
          }

          const result2 = op(numbers[j]!, numbers[i]!)
          if (!isNaN(result2)) {
            maxIntermediate = Math.max(maxIntermediate, result2)

            const newNumbers2 = [...remainingNumbers, result2].sort((a, b) => a - b)
            const stateKey2 = newNumbers2.join(',')

            if (!seenStates.has(stateKey2)) {
              seenStates.add(stateKey2)
              helper(newNumbers2)
            }
          }
        }
      }
    }
  }

  helper(numbers)

  return {
    solvable: solutionCount > 0,
    solutionCount,
    maxIntermediate,
  }
}

// Difficulty classification
function getLevel(numbers: number[]): number {
  const analysis = analyzeSolutions(numbers)

  if (!analysis.solvable)
    return 0

  const unique = new Set(numbers).size
  const hasOne = numbers.includes(1)
  const hasFactor = numbers.some(n => 24 % n === 0 && n > 1)
  const maxNum = Math.max(...numbers)
  const minNum = Math.min(...numbers)

  // Level 1: Direct construction
  // Easy patterns: contains 1, many duplicates, or simple factor combinations
  if (hasOne && unique <= 3)
    return 1

  if (unique <= 2)
    return 1

  if (hasFactor && unique === 3 && hasOne)
    return 1

  // Level 2: Two-step linear
  // Moderate difficulty: has factors of 24 or contains 1
  if (hasOne)
    return 2

  if (hasFactor && unique === 3)
    return 2

  if (unique === 3)
    return 2

  // Level 5: Tight constraint / single path (check first!)
  // All unique, no easy factors, includes primes or difficult combinations
  if (unique === 4 && !hasFactor)
    return 5

  // Level 3: Ordered assembly
  // Numbers spread out, no 1s, all unique with small factors
  if (unique === 4 && hasFactor && maxNum <= 6)
    return 3

  if (unique === 4 && minNum >= 2 && maxNum <= 5)
    return 3

  // Level 4: Constrained composition
  // No 1s, all unique, includes larger numbers with factors
  if (unique === 4 && hasFactor)
    return 4

  // Default fallback
  return 3
}

// Generate combinations (with repetition, sorted to avoid duplicates)
function generateCombinations(): number[][] {
  const results: number[][] = []
  for (let a = 1; a <= 9; a++)
    for (let b = a; b <= 9; b++)
      for (let c = b; c <= 9; c++)
        for (let d = c; d <= 9; d++)
          results.push([a, b, c, d])
  return results
}

// Main
function main() {
  const combinations = generateCombinations()
  const total = Array.from({ length: 6 }, () => 0)

  const json = combinations.map(numbers => {
    const level = getLevel(numbers)
    total[level]!++
    return { numbers, level }
  })

  console.log(total)
  fs.writeFileSync('results.json', JSON.stringify(json, null, 2))

  console.log(`Generated ${json.length} combinations.`)
}

main()
