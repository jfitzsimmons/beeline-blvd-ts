const defaults = {
  occupant: '',
  schedule: 'tutorial_shift1',
  ward: false,
  fallback: false,
  onScreen: false,
}
export default {
  grounds_worker1: {
    name: 'worker1',
    room: 'grounds',
    roles: ['labor', 'gang1', 'gang3', 'gang4', 'contractors', 'mailroom'],
    ...defaults,
  },
  grounds_aid: {
    name: 'aid',
    room: 'grounds',
    swap: 'guard',
    roles: ['doctors', 'staff', 'labor', 'church', 'visitors', 'security'],
    ...defaults,
  },
  grounds_guard: {
    name: 'guard',
    room: 'grounds',
    swap: 'aid',
    roles: ['security', 'gang1', 'gang3'],
    ...defaults,
  },
  grounds_unplaced: { name: 'unplaced', room: 'grounds', ...defaults },
  infirmary_patient1: { name: 'patient1', room: 'infirmary', ...defaults },
}
