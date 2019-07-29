const fs = require('fs')
const path = require('path')
const RefreshVP = require('../functions/refresh-vp')
const agencies = require('../lib/agency-models')

const filesrc = dir => path.join(process.cwd(), dir)

const getLastUpdateTime = (agencyId) => new Promise((resolve, reject) => {
  fs.stat(filesrc(`./tmp/realtime/${agencyId}.pb`), (err, stats) => {
    if (err) reject(err)
    const timestamp = new Date(stats.mtime).valueOf()
    resolve(timestamp)
  })
})

const checkEverythingIsUpdated = async () => {
  for (let agencyId in agencies) {
    if (!fs.existsSync(filesrc(`./tmp/realtime/${agencyId}.pb`))) continue
    const lut = await getLastUpdateTime(agencyId)
    // 35 seconds without an update
    // so trigger recursion loop again
    if (Date.now() - 35000 > lut) RefreshVP(agencyId)
  }
}

module.exports = async (req, res, next) => {
  await checkEverythingIsUpdated()
  next()
}
