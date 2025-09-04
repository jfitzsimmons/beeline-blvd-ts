import { RoomsInitLayout } from '../states/inits/roomsInitState'
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

export function getAdjacentRooms(center: string): string[] {
  const c = rooms.all[center].matrix
  const adjacent = []
  if (c.y - 1 > -1 && c.x - 1 > -1)
    adjacent.push(
      RoomsInitLayout[c.y - 1][c.x],
      RoomsInitLayout[c.y - 1][c.x - 1],
      RoomsInitLayout[c.y][c.x - 1]
    )
  if (c.y + 1 < 6 && c.x + 1 < 5)
    adjacent.push(
      RoomsInitLayout[c.y + 1][c.x],
      RoomsInitLayout[c.y + 1][c.x + 1],
      RoomsInitLayout[c.y][c.x + 1]
    )
  if (c.y - 1 > -1 && c.x + 1 < 5)
    adjacent.push(RoomsInitLayout[c.y - 1][c.x + 1])
  if (c.y + 1 < 6 && c.x - 1 > -1)
    adjacent.push(RoomsInitLayout[c.y - 1][c.x + 1])

  return adjacent
}
