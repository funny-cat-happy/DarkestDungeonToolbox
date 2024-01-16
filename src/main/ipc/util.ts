import { shell } from 'electron'
import { ipcMain } from 'electron'
export default () => {
  ipcMain.on('util:openUrl', async (_, url) => {
    shell.openExternal(url)
  })
}
