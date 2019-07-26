const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const pkg = require('../package.json')

const filesrc = dir => path.join(process.cwd(), dir)
const { TRANSIT_AGENCY = 'Miami-Dade Transit' } = process.env

const getLastUpdateTime = () => new Promise((resolve, reject) => {
  fs.stat(filesrc('./tmp/realtime/VehiclePositions.pb'), (err, stats) => {
    if (err) reject(err)
    const timestamp = new Date(stats.mtime).valueOf()
    resolve(timestamp)
  })
})

const calcElapsedTime = (timestamp, now = Date.now()) => {
  let time = (now - timestamp) / 1000 / 60
  let newTime = time
  let timeStr = ``
  let fx
  if (time < 1 && time * 60 <= 59) {
    newTime *= 60
    fx = newTime.toFixed(0)
    timeStr = fx + ` second${fx === '1' ? '' : 's'} ago`
  } else if (time >= 1 && time <= 59) {
    fx = newTime.toFixed(0)
    timeStr = fx + ` minute${fx === '1' ? '' : 's'} ago`
  } else {
    newTime /= 60
    fx = newTime.toFixed(0)
    timeStr = fx + ` hour${fx === '1' ? '' : 's'} ago`
  }
  return timeStr
}

const getElapsed = async () => {
  const timestamp = await getLastUpdateTime()
  return calcElapsedTime(timestamp, Date.now())
}

const getTotalUpdates = () => {
  const num = Number(process.env.VP_UPDATE_COUNT)
  const fmt = num.toLocaleString('en')
  let str = ''
  if (num >= 2 || num === 0) str = `${fmt} total updates`
  else str = `${fmt} total update`
  return str
}

router.all('/', async (req, res) => {
  const template = fs.readFileSync(filesrc('./static/.index.html'), 'utf8')
  const intpl = template
    .replace(/(\$TRANSIT_AGENCY)/gm, TRANSIT_AGENCY)
    .replace(/(\$PKGVERSION)/gm, pkg.version)
    .replace(/(\$LAST_UPDATE_TIME)/gm, await getElapsed())
    .replace(/(\$TOTAL_UPDATES)/gm, getTotalUpdates())
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(intpl)
})

module.exports = router
