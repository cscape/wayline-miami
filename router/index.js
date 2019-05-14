const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const pkg = require('../package.json')

const filesrc = dir => path.join(process.cwd(), dir)
const { TRANSIT_AGENCY = 'Miami-Dade Transit' } = process.env

router.all('/', (req, res) => {
  const template = fs.readFileSync(filesrc('./static/.index.html'), 'utf8')
  const intpl = template
    .replace(/(\$TRANSIT_AGENCY)/gm, TRANSIT_AGENCY)
    .replace(/(\$PKGVERSION)/gm, pkg.version)
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(intpl)
})

module.exports = router
