const fs = require('fs')
const path = require('path')

// makes sure that /tmp exists on the root folder
// or else bad things happen
module.exports = () => {
  ;([
    'tmp',
    'tmp/realtime',
    'tmp/static',
    'tmp/gtfs'
  ]).map(a => path.join(__dirname, `../` + a))
    .forEach(a => !fs.existsSync(a) ? fs.mkdirSync(a) : 0)
}
