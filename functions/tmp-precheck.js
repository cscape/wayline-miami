const fs = require('fs')
const path = require('path')

// makes sure that /tmp exists on the root folder
// or else bad things happen
module.exports = () => {
  const dir = path.join(process.cwd(), './tmp')
  const realtime = path.join(process.cwd(), './tmp/realtime')
  const staticDir = path.join(process.cwd(), './tmp/static')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
    fs.mkdirSync(realtime)
    fs.mkdirSync(staticDir)
  }
}
