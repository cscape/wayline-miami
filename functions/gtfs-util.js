const realtime = require('gtfs-rb')

const GTFSUtil = {
  clone: obj => JSON.parse(JSON.stringify(obj)),
  makeMessageTemplate: (timestamp = Date.now()) =>
    new realtime.FeedMessage({
      header: new realtime.FeedHeader({
        gtfs_realtime_version: '1.0',
        timestamp
      })
    }),
  genEnglishString: (text) => {
    const translation = new realtime.TranslatedString()
    translation.translation.push(new realtime.TranslatedString.Translation({
      language: 'en',
      text: text
    }))
    return translation
  },
  getEpochTime: (timeStr) => timeStr ? (parseInt(timeStr, 10) / 1000) : null,
  isArray: Array.isArray
}

module.exports = GTFSUtil
