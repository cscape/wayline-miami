const fs = require('fs')
const path = require('path')
const RefreshVP = require('../functions/refresh-vp')

const filesrc = dir => path.join(process.cwd(), dir)

const getLastUpdateTime = () => new Promise((resolve, reject) => {
  fs.stat(filesrc('./tmp/realtime/VehiclePositions.pb'), (err, stats) => {
    if (err) reject(err)
    const timestamp = new Date(stats.mtime).valueOf()
    resolve(timestamp)
  })
})

module.exports = async (req, res, next) => {
  const lut = await getLastUpdateTime()

  // 20 seconds without an update
  // so trigger recursion loop again
  if (Date.now() - 20000 > lut) {
    RefreshVP()
  }

  next()
}
