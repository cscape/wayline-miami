const fs = require('fs')
const path = require('path')
const genVP = require('./gen-vp')

const SaveVehiclePositions = async () => {
  console.log('Generating VehiclePositions')
  const binaryDataArray = await genVP()
  const output = path.join(process.cwd(), `./tmp/realtime/VehiclePositions.pb`)
  const outputd = path.join(process.cwd(), `./tmp/realtime/VehiclePositionsDelimited.pb`)
  await fs.writeFileSync(output, binaryDataArray[0])
  await fs.writeFileSync(outputd, binaryDataArray[1])
  console.log('Saved VehiclePositions')
  return output
}

module.exports = SaveVehiclePositions
