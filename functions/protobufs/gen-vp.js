const gtfsReadyMDT = require('../gen-mdt-gtfs')
const gtfsRB = require('gtfs-rb').transit_realtime

const {
  FeedMessage, FeedHeader
} = gtfsRB

const vpProtobuf = async (raw = false, timestamp = Date.now()) => {
  const busFeedEntities = await gtfsReadyMDT()
  const exportFeed = new FeedMessage({
    header: new FeedHeader({
      gtfs_realtime_version: '2.0',
      incrementality: gtfsRB.FeedHeader.Incrementality.FULL_DATASET,
      timestamp
    }),
    entity: busFeedEntities
  })

  const verify = FeedMessage.verify(exportFeed)
  if (verify == null) {
    if (raw) return exportFeed
    else {
      return FeedMessage.encode(exportFeed).finish()
    }
  } else {
    throw new Error('FEED ERROR: ' + verify)
  }
}

module.exports = vpProtobuf
