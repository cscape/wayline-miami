# ![Miami-Dade Transit GTFS-RT Server](static/micro-express.svg)

Web server that generates [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) Vehicle Positions data for Miami-Dade Transit.

## Project Goals

The server should be able to run continuously, serving as both a proxy for the Miami-Dade Transit GTFS as well as provider of GTFS Realtime data. The GTFS-RT data should remain cached in the server memory and refreshed roughly every 25-30 seconds (Google fetches updates every 30secs, other apps may behave the same way). The Miami-Dade Transit GTFS should be fetched hourly and at server start-up.

If the GTFS zip is missing data (like the Coral Gables Trolley, Grand Avenue route) then it's assumed that it doesn't exist and therefore shouldn't be linked, interpolated, or backfilled with guessed data.

## Table of Progress

For Trip Updates, we're using TheTransitClock to generate the realtime data from the Vehicle Positions.
This is yet to be automated and is still in development. More documentation will follow.

### Vehicle Positions

Generated GTFS Realtime data **must** follow the structure and underlying data types [as the MBTA's own GTFS Realtime data](https://www.mbta.com/developers/gtfs-realtime), including `Long` data types where necessary and ensuring everything is consistent.

- [x] All Metrobus locations
- [x] All Metrorail locations
- [x] All Metromover locations
- [x] All Trolley locations - link TSO Mobile (Miami/Doral/Beach/Aventura + other trolleys) data with MDT GTFS
- [x] Coral Gables Trolley - link ETA Transit data with MDT GTFS
- [ ] Tri-Rail train locations
- [ ] SFRTA connector locations
- [ ] Broward County Transit bus locations
- [ ] Trolley (Broward) locations - TSO Mobile data
- [ ] Palm Tran bus locations
- [ ] Trolley (Palm Beach) locations - link TSO data

## License

[MIT](LICENSE) © [Cyberscape](https://cyberscape.co/).
