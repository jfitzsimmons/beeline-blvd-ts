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
