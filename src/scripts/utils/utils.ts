// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)

export function arraymove(arr: string[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex]
  arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, element)
}
//math.randomseed(os.time())
//const { player } = globalThis.game.world
export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export function dice_roll() {
  const chances = [math.random(), math.random()]
  return chances.sort()
}

export function surrounding_room_matrix(
  target: { x: number; y: number },
  exit: { x: number; y: number }
) {
  // const exit = player.matrix
  let direction = {
    front: { x: 0, y: 0 },
    back: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  }
  //get directions based on way exit is facing
  if (exit.x > target.x) {
    direction = {
      front: { x: target.x - math.random(0, 2), y: target.y },
      back: { x: target.x + 2, y: target.y },
      left: { x: target.x, y: target.y + 1 },
      right: { x: target.x, y: target.y - 1 },
    }
  } else if (exit.y < target.y) {
    direction = {
      front: { x: target.x, y: target.y + math.random(0, 2) },
      back: { x: target.x, y: target.y - 2 },
      left: { x: target.x + 1, y: target.y },
      right: { x: target.x - 1, y: target.y },
    }
  } else if (exit.y > target.y) {
    direction = {
      front: { x: target.x, y: target.y - math.random(0, 2) },
      back: { x: target.x, y: target.y + 2 },
      left: { x: target.x - 1, y: target.y },
      right: { x: target.x + 1, y: target.y },
    }
  } else {
    direction = {
      front: { x: target.x + math.random(0, 2), y: target.y },
      back: { x: target.x - 2, y: target.y },
      left: { x: target.x, y: target.y - 1 },
      right: { x: target.x, y: target.y + 1 },
    }
  }
  return direction
}
