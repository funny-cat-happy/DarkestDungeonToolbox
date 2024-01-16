export interface utilApiType {
  openUrl: (name: string) => void
}

declare global {
  interface Window {
    util: utilApiType
  }
}
