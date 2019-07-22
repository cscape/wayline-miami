const axios = require('axios')
const cfg = require('@wayline/config')
const { PubTransLocations } = require('@wayline/transformer').TSOMobile
const basefeed = cfg.basefeeds.TSOMobile

const RouteFlatmap = (() => cfg.TSOMobile
  .map(o => o.routeMap)
  .reduce((p, c) => ({ ...p, ...c }), {}))()

const HeadsignsFlatmap = (() => cfg.TSOMobile
  .map(o => o.headsigns)
  .reduce((p, c) => ({ ...p, ...c }), {}))()

const getAllVehicles = (url = basefeed) => new Promise((resolve, reject) => {
  const locations = []
  const keys = Object.keys(RouteFlatmap)
  const requests = keys.map(k => axios.get(`${url}PubTrans/GetModuleInfoPublic?Key=UNITS_LOCATION_ROUTE&id=${k}&lan=en`))

  Promise.all(requests).catch(err => {
    console.error(`Failed fetching TSO data: ${err}`)
  }).then(responses => {
    responses.map(({ data }) => {
      const jsonData = JSON.parse(data)
      const cleaned = PubTransLocations(jsonData)
      cleaned.forEach(a => {
        // headsigns are null if its a bus
        a.headsign = HeadsignsFlatmap[a.route_id] || null
        a.gtfs_route_id = RouteFlatmap[a.route_id]
        // bus names in MDT data (tracked w/ TSO) are shown as "LSF123" with LSF at the start + bus number
        // NOTE: Also buses like AT5779 on MDT tracker but "5779" on TSO, account for this! (only MDT agency)
        a.name_link = a.name.indexOf('Bus ') === 0 ? 'LSF' + a.name.split(/\s/)[1] : null
        locations.push(a)
      })
    })
  }).then(() => {
    resolve(locations)
  })
})

const Fetcher = async () => {
  const vehicles = await getAllVehicles()
  return vehicles
}

module.exports = Fetcher
