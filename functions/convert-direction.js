const directionMap = {
  'N': 0,
  'NE': 45,
  'E': 90,
  'SE': 135,
  'S': 180,
  'SW': 225,
  'W': 270,
  'NW': 315
}

const aliasMap = {
  'north': 'N',
  'south': 'S',
  'east': 'E',
  'west': 'W',
  'bound': ''
}

const DirectionMapper = d => {
  // If it's a number, slice down to whole number and get its modulo result from 360
  if (typeof d === 'number') return Number(d.toFixed(0)) % 360

  let direction = String(d).replace(/[^A-Za-z]/g, '').toLowerCase()
  Object.keys(aliasMap).forEach(key => {
    if (direction.indexOf(key) === -1) return
    direction = direction.replace(key, aliasMap[key])
  })
  direction = direction.toUpperCase()
  if (directionMap[direction] == null) throw new Error(`${d} is not a valid direction name!`)
  const numer = directionMap[direction]
  return numer
}

module.exports = DirectionMapper
