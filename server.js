require('./functions/tmp-precheck')()

const express = require('express')
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

async function start () {
  feedUpdater.start() // start cron job
  loadGTFSintoFs()

  const host = process.env.$HOST || process.env.HOST || '127.0.0.1'
  const port = process.env.$PORT || process.env.PORT || 3000

  app.use(express.static('./static', {
    dotfiles: 'ignore'
  }))

  // Listen the server
  app.listen(port, () => console.log(`Server listening on http://${host}:${port}`))
}

start()
