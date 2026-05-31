const isDevelopment = process.env.NODE_ENV === 'development'

const write = (method, args) => {
  if (!isDevelopment || typeof globalThis === 'undefined') {
    return
  }

  const target = globalThis['console']
  const output = target?.[method]
  if (typeof output === 'function') {
    output.apply(target, args)
  }
}

const logger = {
  debug(...args) {
    write('debug', args)
  },
  info(...args) {
    write('info', args)
  },
  warn(...args) {
    write('warn', args)
  },
  error(...args) {
    write('error', args)
  }
}

export default logger
