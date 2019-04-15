const gtfsRB = require('gtfs-rb').transit_realtime

const GTFSUtil = {
  clone: obj => JSON.parse(JSON.stringify(obj)),
  makeMessageTemplate: (timestamp = Date.now()) =>
    new gtfsRB.FeedMessage({
      header: new gtfsRB.FeedHeader({
        gtfs_realtime_version: '1.0',
        timestamp
      })
    }),
  genEnglishString: (text) => {
    const translation = new gtfsRB.TranslatedString()
    translation.translation.push(new gtfsRB.TranslatedString.Translation({
      language: 'en',
      text: text
    }))
    return translation
  },
  getEpochTime: (timeStr) => timeStr ? (parseInt(timeStr, 10) / 1000) : null,
  isArray: Array.isArray
}

module.exports = GTFSUtil
