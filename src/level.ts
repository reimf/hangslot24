import { Combination } from './combination.js'

export class Level {
  public static readonly EASY = new Level(65, Infinity, 'level-easy', 1)
  public static readonly MEDIUM = new Level(25, 64, 'level-medium', 2)
  public static readonly HARD = new Level(1, 24, 'level-hard', 3)

  private static readonly ALL: Level[] = [Level.EASY, Level.MEDIUM, Level.HARD]

  private readonly minCount: number
  private readonly maxCount: number
  private readonly cssClass: string
  private readonly difficulty: number
  private readonly combinations: Combination[] = []

  private constructor(minCount: number, maxCount: number, cssClass: string, difficulty: number) {
    this.minCount = minCount
    this.maxCount = maxCount
    this.cssClass = cssClass
    this.difficulty = difficulty
  }

  public static initialise(): void {
    for (const combination of Combination.generateAll())
      Level.ALL.forEach(level => level.addCombination(combination))
  }

  public getCssClass(): string {
    return this.cssClass
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
