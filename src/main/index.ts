import { app, shell, BrowserWindow } from 'electron'
import './constant'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { access, constants, mkdir, writeFile } from 'fs/promises'
import icon from '../../resources/icon.png?asset'
import registerIpcEvents from './ipc'
import { initI18n } from './i18n'
import logger from './log'
import { stringify } from '@iarna/toml'

initI18n()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1330,
    height: 800,
    title: 'darkestdungeontoolbox',
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  registerIpcEvents()
  electronApp.setAppUserModelId('com.piecat.darkestdungeontoolbox')
  await access(process.env.APPDATAPATH as string, constants.F_OK).catch(async (error) => {
    await mkdir(error.path, {
      recursive: true
    })
  })
  try {
    await access(join(process.env.APPDATAPATH as string, 'config.toml'), constants.F_OK)
  } catch (error) {
    const initConfig = {
      Base: {
        GameId: '0',
        ArchivePath: '',
        language: 'en'
      },
      ArchiveSlot: []
    }
    const initConfigStr = stringify(initConfig)
    await writeFile(join(process.env.APPDATAPATH as string, 'config.toml'), initConfigStr)
  }
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils

  app.on('browser-window-created', (_, window) => {
    if (is.dev) {
      window.webContents.openDevTools()
      optimizer.watchWindowShortcuts(window)
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
