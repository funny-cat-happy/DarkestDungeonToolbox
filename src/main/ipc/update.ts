import { ipcMain, autoUpdater, dialog } from 'electron'
import i18next from 'i18next'
import logger from '../log'

const url = 'null'
let manualUpdate = false
autoUpdater.setFeedURL({ url })
autoUpdater.on('update-downloaded', (_, releaseNotes, releaseName) => {
  const dialogOpts = {
    buttons: [i18next.t('Update.Restart'), i18next.t('Update.Later')],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: i18next.t('Update.Message')
  }
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})
autoUpdater.on('update-not-available', () => {
  if (manualUpdate) {
    dialog.showMessageBox({
      title: i18next.t('Update.NoUpdateTitle'),
      message: i18next.t('Update.NoUpdateMessage')
    })
  }
})
autoUpdater.on('update-available', () => {
  if (manualUpdate) {
    dialog.showMessageBox({
      title: i18next.t('Update.HaveUpdateTitle'),
      message: i18next.t('Update.HaveUpdateMessage')
    })
  }
})
autoUpdater.on('error', (message) => {
  dialog.showErrorBox(i18next.t('Update.ErrorTitle'), message.message)
  logger.error(message)
})
export default () => {
  ipcMain.on('update:checkUpdate', () => {
    manualUpdate = true
    autoUpdater.checkForUpdates()
  })
}
