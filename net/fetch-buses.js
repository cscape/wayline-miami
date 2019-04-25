const axios = require('axios')
const { BusesVerbose } = require('@wayline/transformer').MiamiDadeTransit
const { xml2json } = require('@wayline/transformer').utils
const basefeed = require('@wayline/config').basefeeds.MiamiDadeTransitVerbose // Note it's verbose
const endpoint = basefeed + 'Buses'

const Fetcher = async (url = endpoint) => {
  try {
    const { data } = await axios.get(url)
    const cleaned = BusesVerbose(xml2json(data))
    return cleaned
  } catch (err) {
    console.error(`Failed while fetching ${url}: ${err}`)
  }
}

module.exports = Fetcher
