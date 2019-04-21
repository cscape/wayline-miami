const axios = require('axios')
const cfg = require('@wayline/config')
const { PubTransLocations } = require('@wayline/transformer').TSOMobile
const { xml2json } = require('@wayline/transformer').utils
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

  Promise.all(requests).then(responses => {
    responses.map(({ data }) => {
      const jsonData = JSON.parse(data)
      const cleaned = PubTransLocations(jsonData)
      cleaned.forEach(a => locations.push(a))
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
