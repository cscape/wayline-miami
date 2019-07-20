const fs = require('fs')
const path = require('path')
const genVP = require('./gen-vp')

const SaveVehiclePositions = async () => {
  console.log('Generating VehiclePositions')
  const binaryData = await genVP()
  const output = path.join(process.cwd(), `./tmp/realtime/VehiclePositions.pb`)
  await fs.writeFileSync(output, binaryData)
  console.log('Saved VehiclePositions')
  return output
}

module.exports = SaveVehiclePositions
