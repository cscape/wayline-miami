const gtfsReadyMDT = require('../gen-mdt-gtfs')
const gtfsRB = require('gtfs-rb').transit_realtime
const { toLong } = require('@wayline/transformer').utils.makeTimestamp

const {
  FeedMessage, FeedHeader
} = gtfsRB

const vpProtobuf = async (timestamp = Date.now()) => {
  const busFeedEntities = await gtfsReadyMDT()
  const exportFeed = new FeedMessage({
    header: new FeedHeader({
      gtfsRealtimeVersion: '2.0',
      incrementality: gtfsRB.FeedHeader.Incrementality.FULL_DATASET,
      timestamp: toLong(timestamp)
    }),
    entity: busFeedEntities
  })

  const verify = FeedMessage.verify(exportFeed)
  if (verify == null) {
    return FeedMessage.encode(exportFeed).finish()
  } else {
    throw new Error('FEED ERROR: ' + verify)
  }
}

module.exports = vpProtobuf
