const fetchBuses = require('../net/fetch-buses')
const gtfsRB = require('gtfs-rb').transit_realtime

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const gtfsReadyBuses = async () => {
  const buses = await fetchBuses()
  const busFeedEntities = []
  buses.forEach(busObj => {
    const gtfsobj = new FeedEntity({
      id: `BUSID_${busObj.id}`,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          trip_id: String(busObj.trip_id),
          route_id: String(busObj.route_id)
        }),
        position: new Position({
          latitude: busObj.lat,
          longitude: busObj.lng,
          bearing: busObj.bearing,
          speed: (busObj.speed * 0.447) // speed from mph to m/s, see [1]
        }),
        timestamp: busObj.timestamp,
        vehicle: new VehicleDescriptor({
          id: `${busObj.route_id}-${busObj.name}`,
          label: busObj.headsign
        })
      })
    })
    busFeedEntities.push(gtfsobj)
  })
  return busFeedEntities
}

module.exports = gtfsReadyBuses

/* [1] I'm assuming the speed is in miles-per-hour, and converting it
 * to meters-per-second (m/s) because that's what GTFS-RT wants
 */
