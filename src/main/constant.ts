import { join } from 'path'

process.env.APPDATAPATH = join(
  process.env.HOME || process.env.USERPROFILE!,
  'AppData',
  'LocalLow',
  'DrungeonToolbox'
)
process.env.SERVERURL = 'http://45.153.131.224:8082'
