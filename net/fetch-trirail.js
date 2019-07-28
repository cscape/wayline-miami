const axios = require('axios')
const cfg = require('@wayline/config')
const { Vehicles } = require('@wayline/transformer').ETATransit
const basefeed = cfg.basefeeds.TriRailETA

const CancelToken = axios.CancelToken
const source = CancelToken.source()

const getAllVehicles = async (timeout) => new Promise((resolve, reject) => {
  setTimeout(() => { source.cancel('ETASpot (Tri-Rail) API timed out.') }, timeout)

  axios.get(basefeed, {
    cancelToken: source.token,
    params: { service: 'get_vehicles', token: 'TESTING' }
  }).then(response => {
    try {
      const cleanedData = Vehicles(response.data)
      resolve(cleanedData)
    } catch (_) {
      // Fallback to report no vehicles
      resolve([])
    }
  }).catch(() => resolve([]))
})

// EXAMPLE OF VEHICLES ARRAY:
// [{
//   route_id: 1,
//   pattern_id: 2,
//   id: '517',
//   lat: 26.45873,
//   lng: -80.09098,
//   schedule_id: 'P688',
//   vehicle_type: 'Train',
//   train_id: 949,
//   timestamp: 1564284022000
// }]

const Fetcher = async () => {
  const timeout = 10000
  const vehicles = await getAllVehicles(timeout)
  return vehicles
}

module.exports = Fetcher
