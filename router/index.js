const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const agencies = require('../lib/agency-models')
const pkg = require('../package.json')

const filesrc = dir => path.join(process.cwd(), dir)
const { TRANSIT_AGENCY = 'Miami-Dade Transit' } = process.env

const H4ElementsGTFSRT = (() => {
  let html = ''
  for (let id in agencies) {
    html += `<h4>`
    html += `GET <a href="/realtime/${id}.pb" title="GTFS Realtime Vehicle Positions feed for ${agencies[id].name}">/realtime/${id}.pb</a>`
    html += `</h4>`
    // html += `<p>Returns the feed for ${agencies[id].name}</p>`
  }
  return html
})()

const H4ElementsStatic = (() => {
  let html = ''
  for (let id in agencies) {
    html += `<h4>`
    html += `GET <a href="/gtfs/${id}.zip" title="GTFS feed for ${agencies[id].name}">/gtfs/${id}.zip</a>`
    html += `</h4>`
    // html += `<p>Returns the feed for ${agencies[id].name}</p>`
  }
  return html
})()

const HeadlineLand = (() => {
  const objs = []
  let final = `<p>This server is generating realtime feeds for `
  for (let id in agencies) {
    objs.push(agencies[id].name)
  }
  if (objs.length === 1) final += objs[0]
  if (objs.length === 2) final += objs[0] + ' and ' + objs[1]
  if (objs.length > 2) {
    let newobjs = objs
    newobjs[newobjs.length - 1] = 'and ' + newobjs[newobjs.length - 1]
    const nno = newobjs.join(', ')
    final += nno
  }
  final += `.</p>`
  return final
})()

router.all('/', async (req, res) => {
  const template = fs.readFileSync(filesrc('./static/.index.html'), 'utf8')
  const intpl = template
    .replace(/(\$TRANSIT_AGENCY)/gm, TRANSIT_AGENCY)
    .replace(/(\$PKGVERSION)/gm, pkg.version)
    .replace(/(\$H4_ELEMENTS_GTFSRT)/gm, H4ElementsGTFSRT)
    .replace(/(\$H4_ELEMENTS_STATIC)/gm, H4ElementsStatic)
    .replace(/(\$HEADLINE_LANDING)/gm, HeadlineLand)
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(intpl)
})

module.exports = router
