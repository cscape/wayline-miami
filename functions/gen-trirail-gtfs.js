const fetchTriRail = require('../net/fetch-trirail')
const gtfsRB = require('gtfs-rb').transit_realtime
const masterRouteMaps = require('@wayline/config/routes').SFRTATriRail
const { toLong } = require('@wayline/transformer').utils.makeTimestamp

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const lookupRouteByAlias = c => {
  const alias = String(c).toLowerCase()
  for (let i in masterRouteMaps) {
    if (masterRouteMaps[i].route_shortname.toLowerCase() !== alias) continue
    return masterRouteMaps[i].route_id // gtfs route
  }
  return null
}

const validateRouteId = id => {
  const sId = String(id)
  for (let i in masterRouteMaps) {
    if (masterRouteMaps[i].route_id === sId) return sId
  }
  return null
}

const generateTriRailEntities = vehicles => vehicles.map(vehObj => {
  const vehId = `${vehObj.id}-TR-ETA` // Equipment ID (unique)
  let gtfsRouteId = null // default to blank

  switch (vehObj.route_id) {
    case 1: // TRI-RAIL train route. Either of TRSB/TRNB (Southbound/Northbound)
      if (vehObj.pattern_id === 1) gtfsRouteId = lookupRouteByAlias('TRNB')
      if (vehObj.pattern_id === 2) gtfsRouteId = lookupRouteByAlias('TRSB')
      break
    default:
      // Prevents temporary routes (i.e. Bus Bridge) from showing up on feed
      const rId = validateRouteId(vehObj.route_id)
      if (rId == null) return
      gtfsRouteId = rId
      break
  }

  return new FeedEntity({
    id: vehId,
    vehicle: new VehiclePosition({
      trip: new TripDescriptor({
        routeId: gtfsRouteId
        // vehObj.schedule_id might be used for the GTFS Realtime tripId
      }),
      position: new Position({
        latitude: vehObj.lat,
        longitude: vehObj.lng
      }),
      timestamp: toLong(vehObj.timestamp),
      vehicle: new VehicleDescriptor({
        id: vehId
      })
    })
  })
}).filter(a => a != null) // vehicles flagged as invalid won't be put in

const gtfsReadyEntities = async () => {
  const vehicles = await fetchTriRail()

  return generateTriRailEntities(vehicles)
}

module.exports = gtfsReadyEntities
