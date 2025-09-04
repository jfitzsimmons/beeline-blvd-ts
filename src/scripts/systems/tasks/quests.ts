import { tutorialA, tutorialAscripts, tutorialB } from '../../quests/tutorial'

export const prepareQuestTxts: { [key: string]: (actor: string) => string[] } =
  {
    ['tutorialAscripts']: tutorialAscripts,
    //["tutorialB"] = tutorialBscripts,
  }
export const questChecks: { [key: string]: () => void } = {
  ['tutorialA']: tutorialA,
  ['tutorialB']: tutorialB,
}
/**
 * 

export function quest_checker() {
  let cKey: keyof typeof questChecks
  for (cKey in questChecks) {
    questChecks[cKey]()
  }
}
   */
