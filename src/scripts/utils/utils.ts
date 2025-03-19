// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)

export function cicadaModulus(): boolean {
  const random = math.random(1, 100)
  return random % 3 === 0 || random % 5 == 0 || random % 11 == 0
}
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
  const d = {
    center: target,
    front: { x: 0, y: 0 },
    back: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  }
  //get ds based on way exit is facing
  if (exit.x > target.x) {
    d.front = {
      x: target.x - math.random(0, 2),
      y: target.y + math.random(-1, 1),
    } //west 2,1 no more center?
    d.back = { x: target.x + 1, y: target.y + math.random(-1, 1) } // east
    d.left = { x: target.x - math.random(0, 1), y: target.y + 1 }
    d.right = { x: target.x - math.random(0, 1), y: target.y - 1 }
  } else if (exit.y < target.y) {
    d.front = {
      x: target.x + math.random(-1, 1),
      y: target.y + math.random(0, 2),
    }
    d.back = { x: target.x + math.random(-1, 1), y: target.y - 1 }
    d.left = { x: target.x + 1, y: target.y + math.random(0, 1) }
    d.right = { x: target.x - 1, y: target.y + math.random(0, 1) }
  } else if (exit.y > target.y) {
    d.front = {
      x: target.x + math.random(-1, 1),
      y: target.y - math.random(0, 2),
    }
    d.back = { x: target.x + math.random(-1, 1), y: target.y + 1 }
    d.left = { x: target.x - 1, y: target.y - math.random(0, 1) }
    d.right = { x: target.x + 1, y: target.y - math.random(0, 1) }
  } else {
    d.front = {
      x: target.x + math.random(0, 2),
      y: target.y + math.random(-1, 1),
    }
    d.back = { x: target.x - 1, y: target.y + math.random(-1, 1) }
    d.left = { x: target.x + math.random(0, 1), y: target.y - 1 }
    d.right = { x: target.x + math.random(0, 1), y: target.y + 1 }
  }
  return d
}
