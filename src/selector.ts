export class Selector {
  private firstNumberIndex: number = -1
  private secondNumberIndex: number = -1
  private operatorIndex: number = -1

  public getFirstNumberIndex(): number {
    return this.firstNumberIndex
  }

  public getSecondNumberIndex(): number {
    return this.secondNumberIndex
  }

  public getOperatorIndex(): number {
    return this.operatorIndex
  }

  public isNumberSelected(index: number): boolean {
    return this.firstNumberIndex === index || this.secondNumberIndex === index
  }

  public isOperatorSelected(index: number): boolean {
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

  public selectNumber(index: number): void {
    if (this.firstNumberIndex === -1)
      this.firstNumberIndex = index
    else
      this.secondNumberIndex = index
  }

  public selectOperator(index: number): void {
    this.operatorIndex = index
  }

  public toggleNumber(index: number): boolean {
    if (this.firstNumberIndex === index) {
      this.moveSecondToFirst()
      return true
    }
    if (this.secondNumberIndex === index) {
      this.secondNumberIndex = -1
      return true
    }
    return false
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
