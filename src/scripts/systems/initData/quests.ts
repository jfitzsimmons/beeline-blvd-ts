const defaults = {
  status: {
    active: false,
    passed: false,
    see: false,
    archive: false,
  },
}
export default {
  world_tutorial_start: {
    id: 'world_tutorial_start',
    nextId: 'world_tutorial_task1',
    checkpoint: 'tutorial',
    scope: 'world',
    ...defaults,
  },
  world_tutorial_task1: {
    id: 'world_tutorial_task1',
    nextId: 'world_tutorial_task2',
    ...defaults,
  },
  world_tutorial_task2: {
    id: 'world_tutorial_task2',
    nextId: 'world_tutorial_finish',
    ...defaults,
  },
}
