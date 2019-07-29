const SaveVehiclePositions = require('./protobufs/exec-vp')

// Recursively refresh VehiclePositions
const RefreshVP = (agencyId) => SaveVehiclePositions(agencyId).then(() => {
  setTimeout(() => {
    RefreshVP(agencyId)
  }, 10000)
})

module.exports = RefreshVP
