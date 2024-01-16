import i18next from 'i18next'
import { ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { parse, stringify } from '@iarna/toml'
import type { ConfigType } from '@type/archivefile'
export default () => {
  ipcMain.on('language:switchLanguage', async (_, name) => {
    i18next.changeLanguage(name)
    const config: ConfigType = parse(
      await readFile(join(process.env.APPDATAPATH as string, 'config.toml'), 'utf-8')
    ) as ConfigType
    config.Base.language = name
    await writeFile(join(process.env.APPDATAPATH as string, 'config.toml'), stringify(config))
  })
}
