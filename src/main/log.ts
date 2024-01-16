import { createLogger, transports, format } from 'winston'
import { join } from 'path'
const logger = createLogger({
  level: 'error',
  format: format.simple(),
  transports: [
    new transports.File({
      filename: join(process.env.APPDATAPATH as string, 'error.log'),
      level: 'error'
    })
  ]
})
export default logger
