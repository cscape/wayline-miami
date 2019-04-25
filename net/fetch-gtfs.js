const axios = require('axios')

const GTFSFetcher = async (url = 'https://www.miamidade.gov/transit/googletransit/current/google_transit.zip') => {
  try {
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer'
    })
    return data // binary zip
  } catch (err) {
    console.error(`Failed while fetching ${url}: ${err}`)
  }
}

module.exports = GTFSFetcher
