const axios = require('axios')
const { MoverTrainsVerbose } = require('@wayline/transformer').MiamiDadeTransit
const { xml2json } = require('@wayline/transformer').utils
const basefeed = require('@wayline/config').basefeeds.MiamiDadeTransitVerbose
const endpoint = basefeed + 'MoverTrains'

const Fetcher = async (url = endpoint) => {
  try {
    const { data } = await axios.get(url)
    const cleaned = MoverTrainsVerbose(xml2json(data))
    return cleaned
  } catch (err) {
    throw new Error(`Failed while fetching ${url}: ${err}`)
  }
}

module.exports = Fetcher
