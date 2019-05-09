# OneBusAway Notes

You need to generate a transit bundle using OneBusAway's bundle builder.

```bash
# first run the Wayline Express server
# just to pre-populate tmp/ and fetch gtfs.zip
node server.js

# run the builder jar
# (this also works with the quickstart assembly webapp)
java -Xmx1G -jar onebusaway-transit-data-federation-builder-1.1.19-withAllDependencies.jar -P tripEntriesFactory.throwExceptionOnInvalidStopToShapeMappingException=false tmp/gtfs.zip tmp/oba/
```
