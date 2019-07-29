require('./functions/tmp-precheck')()

const express = require('express')
const fs = require('fs')
const mainRouter = require('./router/index.js')
const keepAlive = require('./router/keepAlive.js')
const apiV1 = require('./router/v1-api')
const { fetchAllGTFS, startAllRefreshVP } = require('./lib/loopers')
const app = express()

process.env.VP_UPDATE_COUNT = 0

const CronJob = require('cron').CronJob
const feedUpdater = new CronJob('0 0 */1 * * *', fetchAllGTFS) // every hour at the 00:00 mark

async function start () {
  const host = process.env.$HOST || process.env.HOST || '127.0.0.1'
  const port = process.env.$PORT || process.env.PORT || 3000

  // start cron jobs
  feedUpdater.start()

  app.use('/api/v1', apiV1)
  app.use('/realtime', keepAlive)
  app.use(express.static('./static', { dotfiles: 'ignore' }))
  app.use(express.static('./tmp'))
  app.use(mainRouter)
  app.use((req, res, next) => {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  app.use((err, req, res, next) => {
    const status = err.status || 500
    const template = fs.readFileSync('./static/.err.html', 'utf8')
    const intpl = template.replace(/(\$ERROR_CODE)/gm, status)
    res.setHeader('Content-Type', 'text/html')
    res.status(status).send(intpl)
  })

  // Listen the server
  app.listen(port, () => console.log(`Server listening on http://${host}:${port}`))

  await fetchAllGTFS() // download gtfs
  startAllRefreshVP()
}

start()
