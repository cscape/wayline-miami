const fs = require('fs')
const path = require('path')

// makes sure that /tmp exists on the root folder
// or else bad things happen
module.exports = () => {
  const dir = path.join(__dirname, '../tmp')
  const realtime = path.join(__dirname, '../tmp/realtime')
  const staticDir = path.join(__dirname, '../tmp/static')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
    fs.mkdirSync(realtime)
    fs.mkdirSync(staticDir)
  }
}
