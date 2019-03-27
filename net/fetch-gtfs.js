const axios = require('axios')

const GTFSFetcher = async (url = 'https://www.miamidade.gov/transit/googletransit/current/google_transit.zip') => {
  const { data } = await axios.get(url)
  return data // binary zip
}

module.exports = GTFSFetcher
