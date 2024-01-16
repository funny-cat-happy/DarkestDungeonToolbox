import { ipcMain, dialog } from 'electron'
import { lstat, readdir, access, constants, mkdir, cp, writeFile, readFile, rm } from 'fs/promises'
import { zip } from 'compressing'
import { join, extname, basename, dirname } from 'path'
import { parse, stringify } from '@iarna/toml'
import i18next from 'i18next'
import { randomUUID } from 'crypto'
import type {
  archiveResType,
  ConfigType,
  travelResType,
  TravelInfoType,
  checkPointResType,
  ClickedInfoType,
  UnlockContentType
} from '@type/archivefile'
import logger from '../log'
import unlockData from '../../../data/archive.json'

export default () => {
  ipcMain.handle('archive:getArchive', async () => {
    let archiveFilePath: string | undefined = join(
      process.env.HOME || process.env.USERPROFILE!,
      'AppData',
      'LocalLow',
      'RedHook',
      'Darkest Dungeon II'
    )
    await access(archiveFilePath, constants.F_OK).catch(() => {
      dialog.showErrorBox(i18next.t('archive.NotFound'), i18next.t('archive.ManualFoundArchive'))
      archiveFilePath = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'showHiddenFiles']
      })?.[0]
    })
    if (archiveFilePath === undefined) {
      return { error: i18next.t('archive.NotFoundArchive'), config: null }
    }
    await access(process.env.APPDATAPATH as string, constants.F_OK).catch(async (err) => {
      await mkdir(err.path)
    })
    const archiveRes: archiveResType = { error: null, config: null }
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
    let archiveFileId = ''
    const archiveConfig: ConfigType = parse(
      await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
    ) as ConfigType
    if (archiveConfig.Base.GameId === '0') {
      let archiveFileIdList: (string | null)[] = []
      try {
        const files = await readdir(join(archiveFilePath, 'SaveFiles'))
        const filterResults = await Promise.all(
          files.map(async (fileName) => {
            const stat = await lstat(join(archiveFilePath!, 'SaveFiles', fileName))
            return stat.isDirectory() && /^\d+$/.test(fileName) ? fileName : null
          })
        )
        archiveFileIdList = filterResults.filter((fileName) => fileName !== null)
      } catch (err) {
        archiveRes.error = i18next.t('archive.GetArchiveFailure')
        return archiveRes
      }
      if (archiveFileIdList.length === 0) {
        archiveRes.error = i18next.t('archive.NullArchive')
        return archiveRes
      }
      if (archiveFileIdList.length > 1) {
        archiveRes.error = i18next.t('archive.ManyArchive')
        return archiveRes
      }
      archiveFileId = archiveFileIdList[0]!
      archiveConfig.Base.GameId = archiveFileId
      archiveConfig.Base.ArchivePath = archiveFilePath
    } else {
      archiveFileId = archiveConfig.Base.GameId
    }
    const archiveId = randomUUID()
    await access(join(process.env.APPDATAPATH as string, 'backup'), constants.F_OK).catch(
      async (err) => {
        await mkdir(err.path)
        await cp(
          join(archiveFilePath!, 'SaveFiles', archiveFileId),
          join(process.env.APPDATAPATH as string, 'backup'),
          {
            recursive: true
          }
        )
      }
    )
    try {
      await cp(
        join(archiveFilePath, 'SaveFiles', archiveFileId),
        join(process.env.APPDATAPATH as string, archiveId),
        {
          recursive: true
        }
      )
      const files = await readdir(
        join(process.env.APPDATAPATH as string, archiveId, 'profiles', 'profile_1_runs')
      )
      files.forEach(async (fileName) => {
        if (extname(fileName) === '.zip') {
          zip.uncompress(
            join(
              process.env.APPDATAPATH as string,
              archiveId,
              'profiles',
              'profile_1_runs',
              fileName
            ),
            join(process.env.APPDATAPATH as string, archiveId, 'profiles', 'profile_1_runs')
          )
          await rm(
            join(
              process.env.APPDATAPATH as string,
              archiveId,
              'profiles',
              'profile_1_runs',
              fileName
            )
          )
        }
      })
    } catch (err) {
      archiveRes.error = i18next.t('archive.CopyArchiveFailure')
      logger.error(err)
      return archiveRes
    }
    archiveConfig.ArchiveSlot.push({
      ArchiveName: 'Slot' + (archiveConfig.ArchiveSlot.length + 1),
      CreateTime: new Date().toLocaleString(),
      ArchivePath: join(process.env.APPDATAPATH as string, archiveId),
      ArchiveId: archiveId
    })
    await writeFile(
      join(process.env.APPDATAPATH as string, 'config.toml'),
      stringify(archiveConfig)
    )
    archiveRes.config = archiveConfig
    return archiveRes
  })
  ipcMain.handle('archive:reName', async (_, id: string, newName: string) => {
    let res = ''
    try {
      const archiveConfig: ConfigType = parse(
        await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
      ) as ConfigType
      archiveConfig.ArchiveSlot!.find((item) => item.ArchiveId === id)!.ArchiveName = newName
      await writeFile(
        join(process.env.APPDATAPATH as string, 'config.toml'),
        stringify(archiveConfig)
      )
    } catch (err) {
      logger.error(err)
      res = i18next.t('archive.RenameFailed')
    }
    return res
  })
  ipcMain.handle('archive:reloadArchive', async () => {
    let isFirstRun = false
    const archiveRes: archiveResType = { error: null, config: null }
    await access(join(process.env.APPDATAPATH as string, 'config.toml'), constants.F_OK).catch(
      async () => {
        isFirstRun = true
      }
    )
    try {
      const archiveConfig: ConfigType = parse(
        await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
      ) as ConfigType
      archiveRes.config = archiveConfig
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TomlError') {
          archiveRes.error = i18next.t('archive.ConfigParseError')
        } else if (isFirstRun) {
          return archiveRes
        } else if (/no such file or directory/.test(error.message) && !isFirstRun) {
          archiveRes.error = i18next.t('archive.ConfigFileNotFound')
        } else {
          archiveRes.error = i18next.t('archive.ArchiveUnknownError')
        }
      } else {
        logger.error(error)
        archiveRes.error = i18next.t('archive.ArchiveUnknownError')
      }
    }
    return archiveRes
  })
  ipcMain.handle('archive:getTravel', async (_, archivePath: string) => {
    const travelRes: travelResType = {
      error: null,
      travelInfo: []
    }
    try {
      const files = await readdir(join(archivePath, 'profiles', 'profile_1_runs'))
      files.forEach(async (fileName) => {
        const travelTime = new Date(
          parseInt('20' + fileName.substring(0, 2)),
          parseInt(fileName.substring(2, 4)) - 1,
          parseInt(fileName.substring(4, 6)),
          parseInt(fileName.substring(7, 9)),
          parseInt(fileName.substring(9, 11)),
          parseInt(fileName.substring(11))
        ).getTime()
        travelRes.travelInfo.push({
          FilePath: join(archivePath, 'profiles', 'profile_1_runs', fileName),
          CreateTime: travelTime
        })
      })
    } catch (err) {
      travelRes.error = i18next.t('archive.TravelParseError')
      logger.error(err)
      return travelRes
    }
    return travelRes
  })
  ipcMain.handle('archive:getCheckPoint', async (_, travelInfo: TravelInfoType) => {
    const checkPointRes: checkPointResType = {
      error: null,
      checkPointInfo: []
    }
    try {
      const files = await readdir(travelInfo.FilePath)
      const fileReadPromises = files.map(async (fileName) => {
        const checkPointType = fileName.substring(10)
        let hasMultiDirectory = false
        // if (checkPointType === 'Combat') {
        //   const turnFiles = await readdir(join(travelInfo.FilePath, fileName))
        //   turnFiles.sort()
        //   fileName = join(fileName, turnFiles[turnFiles.length - 1])
        // }
        await access(join(travelInfo.FilePath, fileName, 'run.json'), constants.F_OK).catch(
          async () => {
            hasMultiDirectory = true
            const recondFiles = await readdir(join(travelInfo.FilePath, fileName))
            recondFiles.sort()
            fileName = join(fileName, recondFiles[recondFiles.length - 1])
          }
        )
        const fileContent = await readFile(join(travelInfo.FilePath, fileName, 'run.json'), 'utf-8')
        const runData = JSON.parse(fileContent)
        const passTime = runData.run_manager.m_timeAtSave
        return {
          checkPointType: checkPointType,
          FilePath: hasMultiDirectory
            ? dirname(join(travelInfo.FilePath, fileName))
            : join(travelInfo.FilePath, fileName),
          CreateTime: passTime + travelInfo.CreateTime
        }
      })
      const results = await Promise.all(fileReadPromises)
      checkPointRes.checkPointInfo.push(...results)
    } catch (err) {
      logger.error(err)
      checkPointRes.error = i18next.t('archive.CheckPointParseError')
      return checkPointRes
    }
    return checkPointRes
  })
  ipcMain.handle('archive:copyArchive', async (_, archivePath: string) => {
    const archiveRes: archiveResType = { error: null, config: null }
    try {
      const archiveConfig: ConfigType = parse(
        await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
      ) as ConfigType
      const newConfig = archiveConfig.ArchiveSlot.find((item) => item.ArchivePath === archivePath)
      if (newConfig === undefined) {
        throw new Error(i18next.t('archive.NotFoundArchive'))
      }
      const archiveId = randomUUID()
      const newArchivePath = join(process.env.APPDATAPATH as string, archiveId)
      archiveConfig.ArchiveSlot.push({
        ArchiveName: 'Slot' + (archiveConfig.ArchiveSlot.length + 1),
        CreateTime: new Date().toLocaleString(),
        ArchivePath: newArchivePath,
        ArchiveId: archiveId
      })
      await cp(archivePath, newArchivePath, {
        recursive: true
      })
      await writeFile(
        join(process.env.APPDATAPATH as string, 'config.toml'),
        stringify(archiveConfig)
      )
      archiveRes.config = archiveConfig
    } catch (err) {
      logger.error(err)
      archiveRes.error = i18next.t('archive.CopyFailed')
    }
    return archiveRes
  })
  ipcMain.handle('archive:deleteArchive', async (_, archivePath: string) => {
    const archiveRes: archiveResType = { error: null, config: null }
    try {
      const archiveConfig: ConfigType = parse(
        await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
      ) as ConfigType
      const newConfig = archiveConfig.ArchiveSlot.filter((item) => item.ArchivePath !== archivePath)
      if (newConfig.length === archiveConfig.ArchiveSlot.length) {
        throw new Error(i18next.t('archive.NotFoundArchive'))
      }
      archiveConfig.ArchiveSlot = newConfig
      await rm(archivePath, { recursive: true })
      await writeFile(
        join(process.env.APPDATAPATH as string, 'config.toml'),
        stringify(archiveConfig)
      )
      archiveRes.config = archiveConfig
    } catch (err) {
      archiveRes.error = i18next.t('archive.DeleteFailed')
      logger.error(err)
    }
    return archiveRes
  })
  ipcMain.handle('archive:changeArchive', async (_, clickedInfo: ClickedInfoType) => {
    const archiveRes: archiveResType = { error: null, config: null }
    try {
      const archiveConfig: ConfigType = parse(
        await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
      ) as ConfigType
      await rm(
        join(
          archiveConfig.Base.ArchivePath,
          'SaveFiles',
          archiveConfig.Base.GameId,
          'profiles',
          'profile_1_runs'
        ),
        {
          recursive: true
        }
      )
      await mkdir(
        join(
          archiveConfig.Base.ArchivePath,
          'SaveFiles',
          archiveConfig.Base.GameId,
          'profiles',
          'profile_1_runs',
          basename(clickedInfo.travelPath),
          basename(clickedInfo.checkPointPath)
        ),
        { recursive: true }
      )
      await cp(
        join(clickedInfo.checkPointPath),
        join(
          archiveConfig.Base.ArchivePath,
          'SaveFiles',
          archiveConfig.Base.GameId,
          'profiles',
          'profile_1_runs',
          basename(clickedInfo.travelPath),
          basename(clickedInfo.checkPointPath)
        ),
        {
          recursive: true
        }
      )
      archiveRes.config = archiveConfig
    } catch (err) {
      archiveRes.error = i18next.t('archive.ChangeArchiveFaild')
      logger.error(err)
    }
    return archiveRes
  })
  ipcMain.handle('archive:unlockContent', async (_, unlockContent: UnlockContentType) => {
    const archiveConfig: ConfigType = parse(
      await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
    ) as ConfigType
    let res = ''
    try {
      const archiveData = unlockData
      const archiveContent = await readFile(
        join(
          archiveConfig.Base.ArchivePath,
          'SaveFiles',
          archiveConfig.Base.GameId,
          'profiles',
          'profile_1.json'
        ),
        'utf-8'
      )
      const profileData = JSON.parse(archiveContent)
      profileData.m_UnlockContainer.m_Unlocks = []
      if (unlockContent.skill) {
        archiveData.skill.forEach((item: string) => {
          profileData.m_UnlockContainer.m_Unlocks.push(item)
        })
        profileData.m_UnlockContainer.m_UnlockTrackSpentProfileValues =
          archiveData.trackspentprofile
        archiveData.herostroy.forEach((item: string) => {
          profileData.m_UnlockContainer.m_Unlocks.push(item)
        })
      }
      if (unlockContent.story) {
        profileData.m_CompletedHeroStories = archiveData.completeherostroy
      } else {
        profileData.m_CompletedHeroStories = []
      }
      if (unlockContent.other) {
        archiveData.other.forEach((item: string) => {
          profileData.m_UnlockContainer.m_Unlocks.push(item)
        })
      }
      await writeFile(
        join(
          archiveConfig.Base.ArchivePath,
          'SaveFiles',
          archiveConfig.Base.GameId,
          'profiles',
          'profile_1.json'
        ),
        JSON.stringify(profileData, undefined, 2)
      )
    } catch (err) {
      res = i18next.t('archive.UnlockFailed')
      logger.error(err)
    }
    return res
  })
  ipcMain.handle('archive:recoverArchive', async () => {
    let res = ''
    try {
      const archiveConfig: ConfigType = parse(
        await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
      ) as ConfigType
      await rm(join(archiveConfig.Base.ArchivePath, 'SaveFiles', archiveConfig.Base.GameId), {
        recursive: true
      })
      await cp(
        join(process.env.APPDATAPATH as string, 'backup'),
        join(archiveConfig.Base.ArchivePath, 'SaveFiles', archiveConfig.Base.GameId),
        {
          recursive: true
        }
      )
    } catch (err) {
      logger.error(err)
      res = i18next.t('archive.RecoverFailed')
    }
    return res
  })
}
