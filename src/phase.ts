import { Level } from './level.js'

export class Phase {
  private static readonly ALL: Phase[] = [
    new Phase([Level.EASY], 3),
    new Phase([Level.MEDIUM], 3),
    new Phase([Level.HARD], 3),
    new Phase([Level.EASY, Level.MEDIUM, Level.HARD], Infinity),
  ]

  private levels: Level[]
  private maxCount: number
  private currentCount: number = 0

  private constructor(levels: Level[], maxCombinations: number) {
    this.levels = levels
    this.maxCount = maxCombinations
  }

  public static initialise(): void {
      Level.initialise()
  }

  private select(): Phase {
    this.currentCount = 0
    return this
  }

  public static first(): Phase {
    return Phase.ALL[0]!.select()
  }

  public isCompleted(): boolean {
    return this.currentCount >= this.maxCount
  }

  public next(): Phase {
    const phaseIndex = Phase.ALL.findIndex(phase => phase === this)
    if (phaseIndex + 1 >= Phase.ALL.length)
      return this
    return Phase.ALL[phaseIndex + 1]!.select()
  }

  public getRandomLevel(): Level {
    this.currentCount++
    const levelIndex = Math.floor(Math.random() * this.levels.length)
    return this.levels[levelIndex]!
  }
}
