const protobuf = require('protobufjs')
const path = require('path')

protobuf.load(path.join(process.cwd(), './static/gtfs-realtime.proto'), (err, root) => {
  if (err) throw err
  const VehiclePosition = root.lookupType('transit_realtime.VehiclePosition')

  const payload = {
    timestamp: 3,
    currentStatus: 2,
    stopId: '498'
  }

  const errMsg = VehiclePosition.verify(payload)
  if (errMsg) throw Error(errMsg)

  // Create a new message
  const message = VehiclePosition.fromObject(payload)
  const buffer = VehiclePosition.encode(message).finish()

  console.log((message))
})
