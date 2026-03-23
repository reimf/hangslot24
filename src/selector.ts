import type { Index } from './padlock.js'

export class Selector {
  private firstNumberIndex: Index = -1
  private secondNumberIndex: Index = -1
  private operatorIndex: Index = -1

  public getFirstNumberIndex(): Index {
    return this.firstNumberIndex
  }

  public getSecondNumberIndex(): Index {
    return this.secondNumberIndex
  }

  public getOperatorIndex(): Index {
    return this.operatorIndex
  }

  public isNumberSelected(index: Index): boolean {
    return this.firstNumberIndex === index || this.secondNumberIndex === index
  }

  public isOperatorSelected(index: Index): boolean {
    return this.operatorIndex === index
  }

  public hasFirstNumber(): boolean {
    return this.firstNumberIndex !== -1
  }

  public hasOperator(): boolean {
    return this.operatorIndex !== -1
  }

  public isInProgress(): boolean {
    return this.firstNumberIndex === -1 || this.operatorIndex === -1 || this.secondNumberIndex === -1
  }

  public selectNumber(index: Index): void {
    if (this.firstNumberIndex === -1 || this.operatorIndex === -1)
      this.firstNumberIndex = index
    else
      this.secondNumberIndex = index
  }

  public selectOperator(index: Index): void {
    this.operatorIndex = index
  }

  public toggleFirstNumber(index: Index): boolean {
    if (this.firstNumberIndex !== index)
      return false
    this.clear()
    return true
  }

  public clear(): void {
    this.firstNumberIndex = -1
    this.secondNumberIndex = -1
    this.operatorIndex = -1
  }

  public clearOperator(): void {
    this.operatorIndex = -1
  }

  public moveSecondToFirst(): void {
    this.firstNumberIndex = this.secondNumberIndex
    this.secondNumberIndex = -1
  }
}
