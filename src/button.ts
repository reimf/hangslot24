export class Button {
  private readonly element: SVGElement

  constructor(element: SVGElement) {
    this.element = element
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

  public addEventListener(type: string, listener: EventListener): void {
    this.element.addEventListener(type, listener)
  }
}