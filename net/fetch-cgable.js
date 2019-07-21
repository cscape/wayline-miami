const axios = require('axios')
const cfg = require('@wayline/config')
const { Vehicles } = require('@wayline/transformer').ETATransit
const basefeed = cfg.basefeeds.CoralGablesETA

const CancelToken = axios.CancelToken
const source = CancelToken.source()

const getAllVehicles = async (timeout) => new Promise((resolve, reject) => {
  setTimeout(() => { source.cancel('Coral Gables Trolley API timed out.') }, timeout)

  axios.get(basefeed, {
    cancelToken: source.token,
    params: { service: 'get_vehicles', token: 'TESTING' }
  }).then(response => {
    try {
      const fixup = Vehicles(response.data)
      resolve(fixup)
    } catch (_) {
      // Fallback to report no vehicles
      resolve([])
    }
  }).catch(() => resolve([]))
})

const Fetcher = async () => {
  const timeout = 10000
  const vehicles = await getAllVehicles(timeout)
  return vehicles
}

module.exports = Fetcher
