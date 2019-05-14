const fetchTrolleys = require('../net/fetch-tso-trolleys')
const fetchBuses = require('../net/fetch-buses')
const fetchRail = require('../net/fetch-metrorail')
const gtfsRB = require('gtfs-rb').transit_realtime
const mdtRoutes = require('@wayline/config/routes').MiamiDadeTransit

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const lookupRouteByAlias = c => {
  const alias = String(c)
  for (let i in mdtRoutes) {
    if (mdtRoutes[i].route_shortname !== alias) continue
    return mdtRoutes[i].route_id // gtfs route
  }
}

const lookupRouteById = c => {
  const id = String(c)
  for (let i in mdtRoutes) {
    if (mdtRoutes[i].route_id !== id) continue
    return mdtRoutes[i].route_shortname // route name: 120, 119, MIACOR
  }
}

const mergeEntities = ([allBuses, allTrolleys, extraBuses, allTrains]) => {
  const allEntities = []
  const grp = [].concat(allTrolleys, extraBuses)
  allBuses.forEach(busObj => {
    const vehIdMDT = `${busObj.route_id}-${busObj.name}-MDT`
    const gtfsRouteId = String(
      // VERY important for valid data
      lookupRouteByAlias(busObj.route_id)
    )
    const gtfsobj = new FeedEntity({
      id: vehIdMDT,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          trip_id: String(busObj.trip_id),
          route_id: gtfsRouteId
        }),
        position: new Position({
          latitude: busObj.lat,
          longitude: busObj.lng,
          bearing: busObj.bearing,
          speed: busObj.speed != null ? (busObj.speed * 0.447) : null
        }),
        timestamp: busObj.timestamp,
        vehicle: new VehicleDescriptor({
          id: vehIdMDT,
          label: busObj.headsign
        })
      })
    })
    allEntities.push(gtfsobj)
  })

  grp.forEach(tsv => {
    const routeShortName = lookupRouteById(String(tsv.gtfs_route_id))
    const vehId = `${routeShortName}-${tsv.name_link || tsv.name}-TSO`
    const gtfsobj = new FeedEntity({
      id: vehId,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          route_id: String(tsv.gtfs_route_id)
        }),
        position: new Position({
          latitude: tsv.lat,
          longitude: tsv.lng,
          bearing: tsv.bearing
        }),
        timestamp: tsv.timestamp,
        vehicle: new VehicleDescriptor({
          id: vehId,
          label: tsv.headsign // May exist, like with Skylake Circulator
        })
      })
    })
    allEntities.push(gtfsobj)
  })

  allEntities.push(...allTrains)

  return allEntities
}

const generateRailEntities = (railTrains) => {
  const newTrains = railTrains.map(trainObj => {
    const vehIdMDT = `${trainObj.route}-${trainObj.id}-MDT`
    const gtfsRouteId = String(
      lookupRouteByAlias('RAIL')
    )
    const gtfsobj = new FeedEntity({
      id: vehIdMDT,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          route_id: gtfsRouteId
        }),
        position: new Position({
          latitude: trainObj.lat,
          longitude: trainObj.lng,
          bearing: trainObj.bearing,
          speed: trainObj.speed != null ? (trainObj.speed * 0.447) : null
        }),
        timestamp: trainObj.timestamp,
        vehicle: new VehicleDescriptor({
          id: vehIdMDT,
          label: `Cars ${trainObj.cars.join(', ')}`
        })
      })
    })
    return gtfsobj
  })
  return newTrains
}

const gtfsReadyEntities = async () => {
  const buses = await fetchBuses()
  const railTrains = await fetchRail() // Metrorail
  const trolleys = await fetchTrolleys()

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
  const allTrains = generateRailEntities(railTrains)
  const allEntities = mergeEntities([allBuses, allTrolleys, extraBuses, allTrains])
  return allEntities
}

module.exports = gtfsReadyEntities
