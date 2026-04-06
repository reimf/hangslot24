export class Logger {
  private readonly webAppUrl: string

  constructor(webAppUrl: string) {
    this.webAppUrl = webAppUrl
  }

  public log(data: any): void {
    fetch(this.webAppUrl, { method: 'POST', body: JSON.stringify(data) })
      .catch(error => console.error(`Failed to log to ${this.webAppUrl}`, error))
  }
}
