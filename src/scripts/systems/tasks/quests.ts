import { tutorialA, tutorialAscripts, tutorialB } from '../../quests/tutorial'

export const prepareQuestTxts: { [key: string]: (actor: string) => string[] } =
  {
    ['tutorialAscripts']: tutorialAscripts,
    //["tutorialB"] = tutorialBscripts,
  }
export const questTasks: { [key: string]: () => void } = {
  ['tutorialA']: tutorialA,
  ['tutorialB']: tutorialB,
}
/**
 * 

export function quest_checker() {
  let cKey: keyof typeof questTasks
  for (cKey in questTasks) {
    questTasks[cKey]()
  }
}
   */
