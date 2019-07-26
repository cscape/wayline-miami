const SaveVehiclePositions = require('./protobufs/exec-vp')

// Recursively refresh VehiclePositions
const RefreshVP = () => SaveVehiclePositions().then(() => {
  setTimeout(RefreshVP, 10000)
})

module.exports = RefreshVP
