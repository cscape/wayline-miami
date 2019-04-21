const fetchAllVehicles = require('../net/fetch-tso-trolleys')
const gtfsRB = require('gtfs-rb').transit_realtime

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const gtfsReadyTSO = async () => {
  const vehicles = await fetchAllVehicles()
  const vehicleEntities = []
  vehicles.forEach(tsv => {
    const gtfsobj = new FeedEntity({
      id: `TSOID_${tsv.id}`,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          // no trip id, merge with MDT
          route_id: String(tsv.gtfs_route_id)
        }),
        position: new Position({
          latitude: tsv.lat,
          longitude: tsv.lng,
          bearing: tsv.bearing
          // no speed
        }),
        timestamp: tsv.timestamp,
        vehicle: new VehicleDescriptor({
          id: `${tsv.id}-${tsv.name_link}`,
          label: tsv.headsign // may not have headsign, merge with MDT
        })
      })
    })
    vehicleEntities.push(gtfsobj)
  })
  return vehicleEntities
}

module.exports = gtfsReadyTSO
