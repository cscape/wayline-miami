const gtfsRB = require('gtfs-rb').transit_realtime
const { toLong } = require('@wayline/transformer').utils.makeTimestamp

const {
  FeedMessage, FeedHeader
} = gtfsRB

const generateVP = async (generatorFnAsync, timestamp = Date.now()) => {
  if (generatorFnAsync == null) throw new Error('GTFS-RT feed generator cannot be null')

  const vehicleFeedEntities = await generatorFnAsync()
  const exportFeed = new FeedMessage({
    header: new FeedHeader({
      gtfsRealtimeVersion: '2.0',
      incrementality: gtfsRB.FeedHeader.Incrementality.FULL_DATASET,
      timestamp: toLong(timestamp)
    }),
    entity: vehicleFeedEntities
  })

  const verify = FeedMessage.verify(exportFeed)
  if (verify == null) {
    return FeedMessage.encode(exportFeed).finish()
  } else {
    throw new Error('FEED ERROR: ' + verify)
  }
}

module.exports = generateVP
