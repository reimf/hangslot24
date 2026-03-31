import { Level } from './level.js'

export class Phase {
  private static readonly ALL: Phase[] = [
    new Phase([Level.EASY], 3),
    new Phase([Level.MEDIUM], 3),
    new Phase([Level.HARD], 3),
    new Phase([Level.EASY, Level.MEDIUM, Level.HARD], Infinity),
  ]

  private levels: Level[]
  private maxCombinations: number
  private countCombinations: number = 0

  private constructor(levels: Level[] = [], maxCombinations: number = 0) {
    this.levels = levels
    this.maxCombinations = maxCombinations
  }

  private select(): Phase {
    this.countCombinations = 0
    return this
  }

  public static first(): Phase {
    return Phase.ALL[0]!.select()
  }

  public isCompleted(): boolean {
    return this.countCombinations >= this.maxCombinations
  }

  public next(): Phase {
    const phaseIndex = Phase.ALL.findIndex(phase => phase === this)
    if (phaseIndex + 1 >= Phase.ALL.length)
      return this
    return Phase.ALL[phaseIndex + 1]!.select()
  }

  public getRandomLevel(): Level {
    this.countCombinations++
    const levelIndex = Math.floor(Math.random() * this.levels.length)
    return this.levels[levelIndex]!
  }
}
