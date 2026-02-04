const server = require('./server')

(async () => {
  try {
    await server.initializeDBandServer({ noListen: false })
    console.log('Backend started')
  } catch (err) {
    console.error('Failed to start backend:', err)
    process.exit(1)
  }
})()
