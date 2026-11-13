import { Combination } from './combination.js'

interface CombinationRow {
  count: number
  number1: number | null
  number2: number | null
  number3: number | null
  number4: number | null
  solutions: number
}

export class Level {
  public static readonly EASY = new Level(1, 65, Infinity)
  public static readonly MEDIUM = new Level(2, 25, 64)
  public static readonly HARD = new Level(3, 1, 24)

  private static readonly ALL: Level[] = [Level.EASY, Level.MEDIUM, Level.HARD]
  private static readonly COMBINATIONS_URL = 'combinations.json'

  private readonly difficulty: number
  private readonly minCount: number
  private readonly maxCount: number
  private readonly combinations: Combination[] = []

  private constructor(difficulty: number, minCount: number, maxCount: number) {
    this.difficulty = difficulty
    this.minCount = minCount
    this.maxCount = maxCount
  }

  public static async initialise(): Promise<void> {
    let combinations: Iterable<Combination>
    try {
      combinations = await Level.loadCombinations()
    } catch (error) {
      console.warn(`Could not load ${Level.COMBINATIONS_URL}, generating combinations instead`, error)
      combinations = Combination.generateAll()
    }
    for (const combination of combinations)
      Level.ALL.forEach(level => level.addCombination(combination))
  }

  private static async loadCombinations(): Promise<Combination[]> {
    const response = await fetch(Level.COMBINATIONS_URL)
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)
    const rows = await response.json() as CombinationRow[]
    const combinations = rows
      .filter(row => row.count === 4 && row.solutions > 0)
      .map(row => new Combination(row.number1!, row.number2!, row.number3!, row.number4!, row.solutions))
    if (combinations.length === 0)
      throw new Error('no solvable combinations')
    return combinations
  }

  public getDifficulty(): number {
    return this.difficulty
  }

  private addCombination(combination: Combination): void {
    if (combination.solutionCount >= this.minCount && combination.solutionCount <= this.maxCount)
      this.combinations.push(combination)
  }

  public getRandomCombination(): Combination {
    const randomIndex = Math.floor(Math.random() * this.combinations.length)
    return this.combinations[randomIndex]!
  }
}
