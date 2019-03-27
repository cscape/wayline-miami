const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

const filesrc = dir => path.join(process.cwd(), dir)
const { TRANSIT_AGENCY = 'Miami-Dade Transit' } = process.env

router.get('/gtfs.zip', (req, res) => {
  res.sendFile(filesrc('/tmp/gtfs.zip'))
})

router.get('/realtime', (req, res) => {
  res.sendFile(filesrc('/tmp/gtfsrt.protobuf'))
})

router.all('/', (req, res) => {
  const template = fs.readFileSync(filesrc('./static/.index.html'), 'utf8')
  const intpl = template.replace(/(\$TRANSIT_AGENCY)/gm, TRANSIT_AGENCY)
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(intpl)
})

module.exports = router
