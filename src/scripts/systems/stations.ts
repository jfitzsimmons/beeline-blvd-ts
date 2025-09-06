import stationsData from './initData/stations'
const { stations, rooms } = globalThis.game.world

export default {
  init() {
    for (const [, elem] of Object.entries(stationsData)) {
      stations.initStation(elem)
      rooms.initStation(elem.room, elem.name)
    }
  },
}
