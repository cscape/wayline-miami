const fs = require('fs')
const path = require('path')
const genVP = require('./gen-vp')

const SaveVehiclePositions = async () => {
  const binaryData = await genVP(true)
  const output = path.join(process.cwd(), `./tmp/realtime/VehiclePositions.pb`)
  await fs.writeFileSync(output, binaryData)
  return output
}

module.exports = SaveVehiclePositions
