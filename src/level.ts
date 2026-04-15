import { Combination } from './combination.js'

export class Level {
  public static readonly EASY = new Level(1, 65, Infinity)
  public static readonly MEDIUM = new Level(2, 25, 64)
  public static readonly HARD = new Level(3, 1, 24)

  private static readonly ALL: Level[] = [Level.EASY, Level.MEDIUM, Level.HARD]

  private readonly difficulty: number
  private readonly minCount: number
  private readonly maxCount: number
  private readonly combinations: Combination[] = []

  private constructor(difficulty: number, minCount: number, maxCount: number) {
    this.difficulty = difficulty
    this.minCount = minCount
    this.maxCount = maxCount
  }

  public static initialise(): void {
    for (const combination of Combination.generateAll())
      Level.ALL.forEach(level => level.addCombination(combination))
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
