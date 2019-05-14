# Miami-Dade Transit GTFS-RT Server

Web server that generates [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) data for Miami-Dade Transit.

## Project Goals

The server should be able to run continuously, serving as both a proxy for the Miami-Dade Transit GTFS as well as provider of GTFS Realtime data. The GTFS-RT data should remain cached in the server memory and refreshed roughly every 25-30 seconds (Google fetches updates every 30secs, other apps may behave the same way). The Miami-Dade Transit GTFS should be fetched hourly and at server start-up, it should remain cached in memory.

If the GTFS zip is missing data (like the Coral Gables Trolley, Grand Avenue route) then it's assumed that it doesn't exist and therefore shouldn't be linked, interpolated, or backfilled with guessed data.

## Table of Progress

For Trip Updates, we're using TheTransitClock to generate the realtime data from the Vehicle Positions.
This is yet to be automated and is still in development. More documentation will follow.

### Vehicle Positions

- [x] All Metrobus locations
- [ ] All Metrorail locations
- [ ] All Metromover locations
- [x] All Trolley locations - link TSO Mobile (Miami/Doral/Beach/Aventura + other trolleys) data with MDT GTFS
- [ ] Coral Gables Trolley - link ETA Transit data with MDT GTFS

### Service Alerts

- [ ] Service alerts from TSO Mobile/ some trolleys (not all use service alerts properly)
- [ ] Service alerts from Coral Gables Trolley
- [ ] Service alerts from Miami-Dade Transit

### Trip Updates

- [ ] Trip updates for MDT buses
- [ ] Trip updates for Metromover
- [ ] Trip updates for Metrorail
- [x] Trip updates for TSO Mobile Trolleys
- [ ] Trip updates for Coral Gables Trolley

## License

[MIT](LICENSE) © [Cyberscape](https://cyberscape.co/).
