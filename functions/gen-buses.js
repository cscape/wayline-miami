const fetchBuses = require('../net/fetch-buses')
const gtfsRB = require('gtfs-realtime-bindings')
const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const gtfsReadyBuses = async () => {
  const buses = await fetchBuses()
  const busFeedEntities = []
  buses.forEach(busObj => {
    const gtfsobj = new FeedEntity({
      id: busObj.id,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          trip_id: String(busObj.trip_id),
          route_id: String(busObj.route_id)
        }),
        position: new Position({
          latitude: busObj.lat,
          longitude: busObj.lng,
          bearing: busObj.bearing
        }),
        timestamp: busObj.timestamp,
        vehicle: new VehicleDescriptor({
          id: busObj.id,
          label: busObj.headsign
        })
      })
    })
    busFeedEntities.push(gtfsobj)
  })
  return busFeedEntities
}

module.exports = gtfsReadyBuses
