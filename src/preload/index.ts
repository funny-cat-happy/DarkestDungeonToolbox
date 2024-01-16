import { contextBridge, ipcRenderer } from 'electron'
import type { TravelInfoType, UnlockContentType } from '@type/archivefile'
import logger from '../main/log'

const archiveApi = {
  getArchive: () => ipcRenderer.invoke('archive:getArchive'),
  archiveRename: (index: number, newName: string) =>
    ipcRenderer.invoke('archive:reName', index, newName),
  reloadArchive: () => ipcRenderer.invoke('archive:reloadArchive'),
  getTravel: (archivePath: string) => ipcRenderer.invoke('archive:getTravel', archivePath),
  getCheckPoint: (travelInfo: TravelInfoType) =>
    ipcRenderer.invoke('archive:getCheckPoint', travelInfo),
  copyArchive: (archivePath: string) => ipcRenderer.invoke('archive:copyArchive', archivePath),
  deleteArchive: (archivePath: string) => ipcRenderer.invoke('archive:deleteArchive', archivePath),
  changeArchive: (archivePath: string) => ipcRenderer.invoke('archive:changeArchive', archivePath),
  unlockContent: (unlockContent: UnlockContentType) =>
    ipcRenderer.invoke('archive:unlockContent', unlockContent),
  recoverArchive: () => ipcRenderer.invoke('archive:recoverArchive')
}

const languageApi = {
  switchLanguage: (name: string) => ipcRenderer.send('language:switchLanguage', name)
}

const utilApi = {
  openUrl: (url: string) => ipcRenderer.send('util:openUrl', url)
}

const updateApi = {
  checkUpdate: () => ipcRenderer.send('update:checkUpdate')
}

try {
  contextBridge.exposeInMainWorld('archive', archiveApi)
  contextBridge.exposeInMainWorld('language', languageApi)
  contextBridge.exposeInMainWorld('util', utilApi)
  contextBridge.exposeInMainWorld('update', updateApi)
} catch (error) {
  logger.error(error)
}
