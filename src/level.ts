export class Level {
  public static readonly EASY   = new Level(65, Infinity, '★☆☆', 'easy',   'level-easy'  )
  public static readonly MEDIUM = new Level(25, 64,       '★★☆', 'medium', 'level-medium')
  public static readonly HARD   = new Level(0,  24,       '★★★', 'hard',   'level-hard'  )

  private static readonly ALL: Level[] = [Level.EASY, Level.MEDIUM, Level.HARD]

  private readonly minCount: number
  private readonly maxCount: number
  public readonly rating: string
  public readonly cssClass: string
  public readonly text: string
  
  private constructor(minCount: number, maxCount: number, rating: string, text: string, cssClass: string) {
    this.minCount = minCount
    this.maxCount = maxCount
    this.rating = rating
    this.text = text
    this.cssClass = cssClass
  }

  public matchesCount(count: number): boolean {
    return count >= this.minCount && count <= this.maxCount
  }

  public nextLevel(): Level {
    const index = Level.ALL.indexOf(this)
    return index + 1 < Level.ALL.length ? Level.ALL[index + 1]! : this
  }
}
