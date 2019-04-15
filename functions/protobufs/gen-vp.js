const gtfsReadyBuses = require('../gen-buses')
const gtfsRB = require('gtfs-rb').transit_realtime

const {
  FeedMessage, FeedHeader
} = gtfsRB

const vpProtobuf = async (raw = true, writer = null, timestamp = Date.now()) => {
  const busFeedEntities = await gtfsReadyBuses()
  const exportFeed = new FeedMessage({
    header: new FeedHeader({
      gtfs_realtime_version: '2.0',
      timestamp
    }),
    entity: busFeedEntities
  })

  const verify = FeedMessage.verify(exportFeed)
  if (verify == null) {
    if (raw) return exportFeed
    else if (writer != null) {
      return FeedMessage.encode(exportFeed, writer)
    } else throw new Error('No writer interface specified!')
  } else {
    throw new Error('FEED ERROR: ' + verify)
  }
}

module.exports = vpProtobuf
