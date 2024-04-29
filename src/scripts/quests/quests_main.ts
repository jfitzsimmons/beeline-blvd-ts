import { tutorialA, tutorialAscripts, tutorialB } from './checkpoints/tutorial'

export const questScripts: { [key: string]: (actor: string) => string[] } = {
  ['tutorialAscripts']: tutorialAscripts,
  //["tutorialB"] = tutorialBscripts,
}
export const questChecks = {
  ['tutorialA']: tutorialA,
  ['tutorialB']: tutorialB,
}

export function quest_checker(interval: string) {
  let cKey: keyof typeof questChecks
  for (cKey in questChecks) {
    questChecks[cKey](interval)
  }
}
