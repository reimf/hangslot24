export class Button {
  private readonly element: SVGElement

  constructor(element: SVGElement) {
    this.element = element
  }

  public isUsable(): boolean {
    return !this.element.classList.contains('disabled') && !this.element.classList.contains('hidden')
  }

  public hide(toggle: boolean): void {
    this.element.classList.toggle('hidden', toggle)
  }

  public disable(toggle: boolean): void {
    this.element.classList.toggle('disabled', toggle)
  }

  public select(toggle: boolean): void {
    this.element.classList.toggle('selected', toggle)
  }

  public setText(text: string): void {
    this.element.querySelector('text')!.textContent = text
  }

  public getText(): string {
    return this.element.querySelector('text')!.textContent!
  }

  public addEventListener(type: string, listener: EventListener): void {
    this.element.addEventListener(type, listener)
  }
}