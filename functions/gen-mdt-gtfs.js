const fetchTrolleys = require('../net/fetch-tso-trolleys')
const fetchBuses = require('../net/fetch-buses')
const gtfsRB = require('gtfs-rb').transit_realtime

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const mergeEntities = ([allBuses, allTrolleys, extraBuses]) => {
  const allEntities = []
  const grp = [].concat(allTrolleys, extraBuses)
  allBuses.forEach(busObj => {
    const gtfsobj = new FeedEntity({
      id: `BUSID_${busObj.id}`,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          trip_id: String(busObj.trip_id),
          route_id: String(busObj.route_id),
          schedule_relationship: 'SCHEDULED' // no way to know so this is assumed
        }),
        position: new Position({
          latitude: busObj.lat,
          longitude: busObj.lng,
          bearing: busObj.bearing,
          speed: busObj.speed != null ? (busObj.speed * 0.447) : null
        }),
        timestamp: busObj.timestamp,
        vehicle: new VehicleDescriptor({
          id: `${busObj.route_id}-${busObj.name}`,
          label: busObj.headsign
        })
      })
    })
    allEntities.push(gtfsobj)
  })

  grp.forEach(tsv => {
    const gtfsobj = new FeedEntity({
      id: `TSOID_${tsv.id}`,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          route_id: String(tsv.gtfs_route_id),
          schedule_relationship: 'SCHEDULED'
        }),
        position: new Position({
          latitude: tsv.lat,
          longitude: tsv.lng,
          bearing: tsv.bearing
        }),
        timestamp: tsv.timestamp,
        vehicle: new VehicleDescriptor({
          id: `${tsv.gtfs_route_id}-${tsv.name_link || tsv.name}`,
          label: tsv.headsign // May exist, like with Skylake Circulator
        })
      })
    })
    allEntities.push(gtfsobj)
  })

  return allEntities
}

const gtfsReadyEntities = async () => {
  const trolleys = await fetchTrolleys()
  const buses = await fetchBuses()
  let busesByName = {}
  buses.forEach(b => (busesByName[b.name] = b))
  const extraBuses = []
  const allTrolleys = []

  trolleys.forEach(tsv => {
    const name = tsv.name_link
    if (name && busesByName[name] != null) {
      // TSO updates every 15 seconds, unlikely that MDT will be more up to date
      if (busesByName[name].timestamp <= tsv.timestamp) {
        delete busesByName[name].speed
        busesByName[name].lat = tsv.lat
        busesByName[name].lng = tsv.lng
        busesByName[name].bearing = tsv.bearing
        busesByName[name].timestamp = tsv.timestamp
      }
    } else if (name != null) { // still a bus, not tracked by MDT
      extraBuses.push(tsv)
    } else { // not a bus, not tracked by MDT: a trolley
      allTrolleys.push(tsv)
    }
  })

  const allBuses = Object.values(busesByName)
  const allEntities = mergeEntities([allBuses, allTrolleys, extraBuses])
  return allEntities
}

module.exports = gtfsReadyEntities
