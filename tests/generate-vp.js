require('../functions/tmp-precheck')() // VERY IMPORTANT!

const { FeedMessage } = require('gtfs-rb').transit_realtime
const { readFileSync } = require('fs')

require('../functions/protobufs/exec-vp')().then(output => {
  console.log('Vehicle positions saved to: ' + output)
  return output
}).then(output => {
  const rawFeed = readFileSync(output) // buffer
  const decodedMessage = FeedMessage.decodeDelimited(rawFeed)
  console.log(decodedMessage)
})
