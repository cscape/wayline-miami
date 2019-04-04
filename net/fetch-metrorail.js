const axios = require('axios')
const { Trains } = require('@wayline/transformer').MiamiDadeTransit
const { xml2json } = require('@wayline/transformer').utils
const basefeed = require('@wayline/config').basefeeds.MiamiDadeTransit
const endpoint = basefeed + 'Trains'

const Fetcher = async (url = endpoint) => {
  const { data } = await axios.get(url)
  const cleaned = Trains(xml2json(data))
  return cleaned
}

module.exports = Fetcher
