const gtfsRB = require('gtfs-rb').transit_realtime
const { readFileSync } = require('fs')
const path = require('path')

// Deconstruct these classes from GTFS Realtime Bindings
const { FeedMessage } = gtfsRB

const rawFeed = readFileSync(path.join(__dirname, '../tmp/realtime/MBTA.pb')) // buffer

const decodedMessage = FeedMessage.decode(rawFeed)

console.log(decodedMessage)
