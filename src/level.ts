import { Combination } from './combination.js'

export class Level {
  public static readonly EASY = new Level(65, Infinity, '★☆☆', 'easy', 'level-easy')
  public static readonly MEDIUM = new Level(25, 64, '★★☆', 'medium', 'level-medium')
  public static readonly HARD = new Level(1, 24, '★★★', 'hard', 'level-hard')

  private static readonly ALL: Level[] = [Level.EASY, Level.MEDIUM, Level.HARD]

  private readonly minCount: number
  private readonly maxCount: number
  public readonly rating: string
  public readonly cssClass: string
  public readonly text: string
  private readonly combinations: Combination[] = []

  private constructor(minCount: number, maxCount: number, rating: string, text: string, cssClass: string) {
    this.minCount = minCount
    this.maxCount = maxCount
    this.rating = rating
    this.text = text
    this.cssClass = cssClass
  }

  public static addCombination(combination: Combination): void {
    Level.ALL.forEach(level => level.addCombination(combination))
  }

  private addCombination(combination: Combination): void {
    if (combination.solutionCount >= this.minCount && combination.solutionCount <= this.maxCount)
      this.combinations.push(combination)
  }

  public getRandomCombination(): Combination {
    const randomIndex = Math.floor(Math.random() * this.combinations.length)
    return this.combinations[randomIndex]!
  }

  public static first(): Level {
    return Level.ALL[0]!
  }

  public next(): Level {
    const index = Level.ALL.indexOf(this)
    return Level.ALL[index + 1] ?? this
  }
}
