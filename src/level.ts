import { Combination } from './combination.js'

export class Level {
  public static readonly EASY   = new Level(65, Infinity, '★☆☆', 'easy',   'level-easy'  )
  public static readonly MEDIUM = new Level(25, 64,       '★★☆', 'medium', 'level-medium')
  public static readonly HARD   = new Level( 0, 24,       '★★★', 'hard',   'level-hard'  )

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

  public addCombination(combination: Combination): void {
    this.combinations.push(combination)
  }

  public static combinationsInRange(minLevel: Level, maxLevel: Level): Combination[] {
    return Level.ALL
      .filter(level => Level.isInRange(level, minLevel, maxLevel))
      .flatMap(level => level.combinations)
  }

  public matchesCount(count: number): boolean {
    return count >= this.minCount && count <= this.maxCount
  }

  public static forCount(count: number): Level {
    return Level.ALL.find(level => level.matchesCount(count))!
  }

  public static isInRange(level: Level, minLevel: Level, maxLevel: Level): boolean {
    const index = Level.ALL.indexOf(level)
    const minIndex = Level.ALL.indexOf(minLevel)
    const maxIndex = Level.ALL.indexOf(maxLevel)
    return index >= minIndex && index <= maxIndex
  }

  public nextLevel(): Level {
    const index = Level.ALL.indexOf(this)
    return index + 1 < Level.ALL.length ? Level.ALL[index + 1]! : this
  }
}
