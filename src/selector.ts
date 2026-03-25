export class Selector {
  private numberIndices: number[] = []
  private operatorIndex: number | undefined = undefined

  public getNumberIndices(): number[] {
    return this.numberIndices
  }

  public getOperatorIndex(): number | undefined {
    return this.operatorIndex
  }

  public isNumberSelected(index: number): boolean {
    return this.numberIndices.includes(index)
  }

  public isOperatorSelected(index: number): boolean {
    return this.operatorIndex === index
  }

  public isInProgress(): boolean {
    return this.numberIndices.length < 2 || this.operatorIndex === undefined
  }

  public selectNumber(index: number): void {
    const position = this.numberIndices.indexOf(index)
    if (position !== -1)
      this.numberIndices.splice(position, 1)
    else if (this.numberIndices.length < 2)
      this.numberIndices.push(index)
    else
      this.numberIndices.splice(1, 1, index)
  }

  public selectOperator(index: number): void {
    if (this.operatorIndex === index)
      this.operatorIndex = undefined
    else
      this.operatorIndex = index
  }

  public clear(): void {
    this.numberIndices = []
    this.operatorIndex = undefined
  }
}
