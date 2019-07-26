const fs = require('fs')
const path = require('path')
const genVP = require('./gen-vp')

const SaveVehiclePositions = async () => {
  console.log('Generating VehiclePositions')
  const binaryData = await genVP()
  const output = path.join(__dirname, `../../tmp/realtime/VehiclePositions.pb`)
  await fs.writeFileSync(output, binaryData)
  console.log('Saved VehiclePositions')
  process.env.VP_UPDATE_COUNT = Number(process.env.VP_UPDATE_COUNT) + 1
  return output
}

module.exports = SaveVehiclePositions
