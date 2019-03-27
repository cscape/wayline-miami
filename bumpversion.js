const fs = require('fs')

fs.readFile(`./package.json`, 'utf8', (err, data) => {
  if (err) return console.log(err)
  const newContents = data
    .split('\n')
    .map(line => {
      if (line.indexOf(`"version"`) === -1) return line
      const sp1 = line.split(`:`) // ['  "version"', ' "2.0.0",']
      const sp2 = sp1[1].split(`"`) // [' ', '2.0.0', ',']
      const vers = sp2[1].split(`.`).map(a => Number(a)) // [2, 0, 0]
      vers[vers.length - 1] += 1 // updates last version number
      sp2[1] = vers.join(`.`)
      sp1[1] = sp2.join(`"`)

      line = sp1.join(`:`)
      return line
    })
    .join('\n')

  fs.writeFile(`./package.json`, newContents, 'utf8', (err) => {
    if (err) return console.log(err)
  })
})
