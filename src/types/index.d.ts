import { Game } from '../scripts/states/gamesystem2'
declare global {
  // eslint-disable-next-line no-var
  var game: Game
  function multiply(a: number, b: number): number
}

export {}
