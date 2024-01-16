export interface updateApiType {
  checkUpdate: () => void
}
declare global {
  interface Window {
    update: updateApiType
  }
}
