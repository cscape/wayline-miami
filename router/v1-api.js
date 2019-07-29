const express = require('express')
const router = express.Router()
const agencies = require('../lib/agency-models')
const pkg = require('../package.json')

const ListOfAgencies = (() => {
  const arr = []
  for (let id in agencies) {
    arr.push({
      name: agencies[id].name,
      gtfs: `/gtfs/${id}.zip`,
      vehicle_positions: `/realtime/${id}.pb`,
      id
    })
  }
  return arr
})()

router.all('/server', async (req, res) => {
  const data = {
    agencies: ListOfAgencies,
    version: pkg.version
  }
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(data)
})

module.exports = router
