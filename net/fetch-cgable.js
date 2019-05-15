const axios = require('axios')
const cfg = require('@wayline/config')
const { Vehicles } = require('@wayline/transformer').ETATransit
const basefeed = cfg.basefeeds.CoralGablesETA

const getAllVehicles = async () => new Promise(
  (resolve, reject) => axios.get(basefeed, {
    params: { service: 'get_vehicles', token: 'TESTING' }
  }).then(response => resolve(Vehicles(response.data)))
    .catch(err => reject(err))
)

const Fetcher = async () => {
  const vehicles = await getAllVehicles()
  return vehicles
}

module.exports = Fetcher
