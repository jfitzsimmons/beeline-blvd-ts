import stationsData from './initData/stations'
const { stations } = globalThis.game.world

export default {
  init() {
    for (const [, elem] of Object.entries(stationsData)) {
      stations.initStation(elem)
    }
  },
}
