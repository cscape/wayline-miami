const agencies = require('./agency-models')
const refreshVP = require('../functions/refresh-vp')

const fetchAllGTFS = async () => {
  const files = []
  for (let agencyId in agencies) {
    const agency = agencies[agencyId]
    console.log(`Downloading GTFS feed for ${agency.name}`)
    const bin = await require('../net/fetch-gtfs')(agency.gtfsURL)
    console.log(`Saving GTFS feed for ${agency.name}`)
    const output = await require('../functions/save-gtfs')(bin, `gtfs/${agencyId}`)
    console.log(`GTFS feed for ${agency.name} has been saved to ${output}`)
    files.push(output)
  }
  return files
}

const startAllRefreshVP = async () => {
  for (let agencyId in agencies) {
    refreshVP(agencyId)
  }
}

module.exports = { fetchAllGTFS, startAllRefreshVP }
