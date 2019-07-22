const fetchTrolleys = require('../net/fetch-tso-trolleys')
const fetchBuses = require('../net/fetch-buses')
const fetchRail = require('../net/fetch-metrorail')
const fetchMovers = require('../net/fetch-movers')
const fetchCGABLE = require('../net/fetch-cgable')
const gtfsRB = require('gtfs-rb').transit_realtime
const mdtRoutes = require('@wayline/config/routes').MiamiDadeTransit
const { toLong } = require('@wayline/transformer').utils.makeTimestamp

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const lookupRouteByAlias = c => {
  const alias = String(c).toLowerCase()
  for (let i in mdtRoutes) {
    if (mdtRoutes[i].route_shortname.toLowerCase() !== alias) continue
    return mdtRoutes[i].route_id // gtfs route
  }
  return null
}

// const lookupRouteById = c => {
//   const id = String(c)
//   for (let i in mdtRoutes) {
//     if (mdtRoutes[i].route_id !== id) continue
//     return mdtRoutes[i].route_shortname // route name: 120, 119, MIACOR
//   }
// }

const mergeEntities = ([allBuses, allTrolleys, extraBuses, allTrains, allMovers, allCGABLE]) => {
  const allEntities = []
  const grp = [].concat(allTrolleys, extraBuses)
  allBuses.forEach(busObj => {
    const vehIdMDT = `${busObj.id}-${busObj.name}-MDT`
    const gtfsRouteId = String(
      // VERY important for valid data
      lookupRouteByAlias(busObj.route_id)
    )
    const gtfsobj = new FeedEntity({
      id: vehIdMDT,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          tripId: String(busObj.trip_id),
          routeId: gtfsRouteId
        }),
        position: new Position({
          latitude: busObj.lat,
          longitude: busObj.lng,
          bearing: busObj.bearing,
          speed: busObj.speed != null ? (busObj.speed * 0.447) : null
        }),
        timestamp: toLong(busObj.timestamp),
        vehicle: new VehicleDescriptor({
          id: vehIdMDT
          // label: busObj.headsign
        })
      })
    })
    allEntities.push(gtfsobj)
  })

  grp.forEach(tsv => {
    const vehId = `${tsv.id}-TSO`
    // const shortName = lookupRouteById(tsv.gtfs_route_id)
    const gtfsobj = new FeedEntity({
      id: vehId,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          routeId: tsv.gtfs_route_id
        }),
        position: new Position({
          latitude: tsv.lat,
          longitude: tsv.lng,
          bearing: tsv.bearing
        }),
        timestamp: toLong(tsv.timestamp),
        vehicle: new VehicleDescriptor({
          id: vehId
          // label: `${shortName}. ${tsv.headsign}` // May exist, like with Skylake Circulator
        })
      })
    })
    allEntities.push(gtfsobj)
  })

  ;[].concat(
    allTrains, allMovers, allCGABLE
  ).forEach(t => allEntities.push(t))

  return allEntities
}

const generateRailEntities = (railTrains) => {
  const newTrains = railTrains.map(trainObj => {
    const vehIdMDT = `${trainObj.id}-RL-MDT`
    const gtfsRouteId = String(
      lookupRouteByAlias('RAIL')
    )
    const gtfsobj = new FeedEntity({
      id: vehIdMDT,
      vehicle: new VehiclePosition({
        trip: new TripDescriptor({
          routeId: gtfsRouteId
        }),
        position: new Position({
          latitude: trainObj.lat,
          longitude: trainObj.lng,
          bearing: trainObj.bearing,
          speed: trainObj.speed != null ? (trainObj.speed * 0.447) : null
        }),
        timestamp: toLong(trainObj.timestamp),
        vehicle: new VehicleDescriptor({
          id: vehIdMDT
          // label: `${trainObj.route}. Cars ${trainObj.cars.join(', ')}`
        })
      })
    })
    return gtfsobj
  })
  return newTrains
}

const generateMoverEntities = movers => movers.map(moverObj => {
  const vehIdMDT = `${moverObj.id}-MV-MDT`
  let gtfsRouteId = null // default to blank

  switch (moverObj.loop_id) {
    case 'INN': gtfsRouteId = lookupRouteByAlias('MMI'); break
    case 'OMN': gtfsRouteId = lookupRouteByAlias('MMO'); break
    case 'BKL': gtfsRouteId = lookupRouteByAlias('MMO'); break
    // OTR = Outer Loop
    // FUL = Full Loop
  }

  return new FeedEntity({
    id: vehIdMDT,
    vehicle: new VehiclePosition({
      trip: new TripDescriptor({
        routeId: gtfsRouteId
      }),
      position: new Position({
        latitude: moverObj.lat,
        longitude: moverObj.lng,
        bearing: moverObj.bearing,
        speed: moverObj.speed != null ? (moverObj.speed * 0.447) : null
      }),
      timestamp: toLong(moverObj.timestamp),
      vehicle: new VehicleDescriptor({
        id: vehIdMDT
        // label: `${moverObj.loop_id} Loop. Cars ${moverObj.cars.join(', ')}`
      })
    })
  })
})

const generateCGEntities = trolleys => trolleys.map(trolleyObj => {
  const vehId = `${trolleyObj.id}-CG-ETA`
  let gtfsRouteId = null // default to blank

  switch (trolleyObj.route_id) {
    case 1: gtfsRouteId = lookupRouteByAlias('CGABLE'); break
  }

  return new FeedEntity({
    id: vehId,
    vehicle: new VehiclePosition({
      trip: new TripDescriptor({
        routeId: gtfsRouteId
      }),
      position: new Position({
        latitude: trolleyObj.lat,
        longitude: trolleyObj.lng
      }),
      timestamp: toLong(trolleyObj.timestamp),
      vehicle: new VehicleDescriptor({
        id: vehId
      })
    })
  })
})

const gtfsReadyEntities = async () => {
  const buses = await fetchBuses()
  const railTrains = await fetchRail() // Metrorail
  const movers = await fetchMovers()
  const trolleys = await fetchTrolleys()
  const cgable = await fetchCGABLE()

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
  const allMovers = generateMoverEntities(movers)
  const allCGABLE = generateCGEntities(cgable)
  const allEntities = mergeEntities([allBuses, allTrolleys, extraBuses, allTrains, allMovers, allCGABLE])
  return allEntities
}

module.exports = gtfsReadyEntities
