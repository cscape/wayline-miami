const fs = require('fs')
const path = require('path')
const generateVP = require('./gen-vp')
const agencyModel = require('../../lib/agency-models')

/**
 * Generates & saves VehiclePositions to tmp folder. Returns file location
 * @param {string} agencyId The ID of a transit agency as in agency-models.js
 */
const SaveVehiclePositions = async (agencyId) => {
  const { entityGenerateAsync, name } = agencyModel[agencyId]

  console.log(`${name}: Generating VehiclePositions`)

  const binaryData = await generateVP(entityGenerateAsync, Date.now())
  const output = path.join(__dirname, `../../tmp/realtime/${agencyId}.pb`)

  try {
    await fs.writeFileSync(output, binaryData)
    console.log(`${name}: Saved VehiclePositions`)
  } catch (err) {
    console.error(`${name}: Failed to save VehiclePositions`, err)
  }

  process.env.VP_UPDATE_COUNT = Number(process.env.VP_UPDATE_COUNT) + 1
  return output
}

module.exports = SaveVehiclePositions
