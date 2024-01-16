import registerArchiveFileIpc from './archivefile'
import registerLanguageIpc from './language'
import registerUtil from './util'
import registerUpdateIpc from './update'

export default () => {
  registerArchiveFileIpc()
  registerLanguageIpc()
  registerUtil()
  registerUpdateIpc()
}
