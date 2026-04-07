export class Selector {
  private firstNumberIndex: number | undefined = undefined
  private secondNumberIndex: number | undefined = undefined
  private operatorIndex: number | undefined = undefined

  public getSelection(): [number, number, number] {
    return [this.firstNumberIndex!, this.operatorIndex!, this.secondNumberIndex!]
  }

  public selectNumber(index: number): void {
    if (this.firstNumberIndex === index)
      this.firstNumberIndex = undefined
    else if (this.secondNumberIndex === index)
      this.secondNumberIndex = undefined
    else if (this.firstNumberIndex === undefined)
      this.firstNumberIndex = index
    else if (this.secondNumberIndex === undefined)
      this.secondNumberIndex = index
    else {
      this.firstNumberIndex = this.secondNumberIndex
      this.secondNumberIndex = index
    }
  }

  public selectOperator(index: number): void {
    if (this.operatorIndex === index)
      this.operatorIndex = undefined
    else
      this.operatorIndex = index
  }

  public isNumberSelected(index: number): boolean {
    return this.firstNumberIndex === index || this.secondNumberIndex === index
  }

  public isOperatorSelected(index: number): boolean {
    return this.operatorIndex === index
  }

  public isComplete(): boolean {
    return this.firstNumberIndex !== undefined && this.secondNumberIndex !== undefined && this.operatorIndex !== undefined
  }

  public clear(): void {
    this.firstNumberIndex = undefined
    this.secondNumberIndex = undefined
    this.operatorIndex = undefined
  }
}
