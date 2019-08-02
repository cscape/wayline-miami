const fetchTriRail = require('../net/fetch-trirail')
const gtfsRB = require('gtfs-rb').transit_realtime
const masterRouteMaps = require('@wayline/config/routes').SFRTATriRail
const { toLong } = require('@wayline/transformer').utils.makeTimestamp

const {
  FeedEntity, VehiclePosition, Position, VehicleDescriptor, TripDescriptor
} = gtfsRB

const validateRouteId = id => {
  const sId = String(id)
  for (let i in masterRouteMaps) {
    if (masterRouteMaps[i].route_id === sId) return sId
  }
  return null
}

const generateTriRailEntities = vehicles => vehicles.map(vehObj => {
  // Would generate ID's like '517-949-ETA' (middle is train #)
  const vehId = `${vehObj.id}-ETA` // Equipment ID (unique)
  let gtfsRouteId = null // default to blank

  switch (vehObj.route_id) {
    case 1: // TRI-RAIL train route.
      // hacky
      if (vehObj.direction === 'South') gtfsRouteId = 'SB'
      if (vehObj.direction === 'North') gtfsRouteId = 'NB'
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
        tripId: String(vehObj.trip_id),
        routeId: String(gtfsRouteId),
        scheduleRelationship: TripDescriptor.ScheduleRelationship.SCHEDULED
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
