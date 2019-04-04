const axios = require('axios')
const { Buses } = require('@wayline/transformer').MiamiDadeTransit
const { xml2json } = require('@wayline/transformer').utils
const basefeed = require('@wayline/config').basefeeds.MiamiDadeTransit
const endpoint = basefeed + 'Buses'

const Fetcher = async (url = endpoint) => {
  const { data } = await axios.get(url)
  const cleaned = Buses(xml2json(data))
  return cleaned
}

module.exports = Fetcher
