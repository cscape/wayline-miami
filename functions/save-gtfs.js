const fs = require('fs')
const path = require('path')

const SaveGTFS = async (binaryData, name = 'gtfs') => {
  const output = path.join(process.cwd(), `/tmp/${name}.zip`)
  await fs.writeFileSync(output, binaryData)
  return output
}

module.exports = SaveGTFS
