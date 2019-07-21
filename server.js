require('./functions/tmp-precheck')()

const express = require('express')
const fs = require('fs')
const mainRouter = require('./router/index.js')
const SaveVehiclePositions = require('./functions/protobufs/exec-vp')
const app = express()

const {
  // environment defaults
  TRANSIT_GTFS_FEED = 'https://www.miamidade.gov/transit/googletransit/current/google_transit.zip'
} = process.env

const loadGTFSintoFs = async () => {
  console.log(`Downloading GTFS feed`)
  const bin = await require('./net/fetch-gtfs')(TRANSIT_GTFS_FEED)
  console.log(`Saving GTFS feed`)
  const output = await require('./functions/save-gtfs')(bin, 'gtfs')
  console.log(`GTFS feed has been saved to ${output}`)
  return output
}

const CronJob = require('cron').CronJob
const feedUpdater = new CronJob('0 0 */1 * * *', loadGTFSintoFs) // every hour at the 00:00 mark

// Recursively refresh VehiclePositions
const RefreshVP = async () => {
  await SaveVehiclePositions()
  setTimeout(RefreshVP, 10000)
}

async function start () {
  const host = process.env.$HOST || process.env.HOST || '127.0.0.1'
  const port = process.env.$PORT || process.env.PORT || 3000

  // start cron jobs
  feedUpdater.start()

  app.use(express.static('./static', {
    dotfiles: 'ignore'
  }))

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

  await loadGTFSintoFs() // download gtfs
  RefreshVP()
}

start()
