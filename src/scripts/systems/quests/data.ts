const defaults = {
  status: {
    active: false,
    passed: false,
    see: false,
    archive: false,
  },
  stage: 0,
}
export default {
  world_tutorial_medic: {
    id: 'world_tutorial_medic',
    //nextId: 'world_tutorial_task1',
    checkpoint: 'tutorial',
    scope: 'world',
    stages: [
      {
        status: { ...defaults.status },
        note: 'Agree to help injured man',
        tasks: [
          {
            type: 'novel',
            subtype: 'subscribe',
            name: 'helpInjuredMan',
            operator: '==',
            value: 'agreedToHelp',
          },
        ],
      },
      {
        status: { ...defaults.status },
        note: 'Find a doctor.',
        tasks: [
          {
            type: 'novel',
            subtype: 'subscribe',
            name: 'findDoctor',
            operator: '==',
            value: 'doctorFound',
          },
        ],
      },
      {
        status: { ...defaults.status },
        note: 'Procurements for the Doctor.',
        tasks: [
          {
            type: 'inventory',
            subtype: 'current',
            name: 'doctorProcureNeeds',
            operator: 'contains',
            value: ['vial', 'apple01'],
          },
          {
            type: 'novel',
            subtype: 'subscribe',
            name: 'deliverDoctorGoods',
            operator: '==',
            value: 'deliverDoctor',
          },
        ],
      },
      {
        status: { ...defaults.status },
        note: 'Finds Meds for injured man.',
        tasks: [
          {
            type: 'inventory',
            subtype: 'current',
            name: 'medsInjuredMan',
            operator: 'contains',
            value: ['vial'],
          },
          {
            type: 'novel',
            subtype: 'subscribe',
            name: 'deliverMedicine',
            operator: '==',
            value: 'medsDelivered',
          },
        ],
      },
      {
        status: { ...defaults.status },
        note: 'Acquire Temporary Clearance.',
        tasks: [
          {
            type: 'inventory',
            subtype: 'current',
            name: 'temporaryClear',
            operator: 'contains',
            value: ['note'],
          },
        ],
      },
    ],
    ...defaults,
  },
  world_tutorial_luggage: {
    id: 'world_tutorial_luggage',
    checkpoint: 'tutorial',
    scope: 'world',
    stages: [
      {
        status: { ...defaults.status },
        note: 'Find ID',
        tasks: [
          {
            type: 'inventory',
            subtype: 'current',
            name: 'findYourID',
            operator: 'contains',
            value: 'playerID',
          },
        ],
      },
      {
        status: { ...defaults.status },
        note: 'Find Jacket',
        tasks: [
          {
            type: 'inventory',
            subtype: 'current',
            name: 'findYourJacket',
            operator: 'contains',
            value: 'playerJacket',
          },
        ],
      },
      {
        status: { ...defaults.status },
        note: 'Find Wallet',
        tasks: [
          {
            type: 'inventory',
            subtype: 'current',
            name: 'findYourWallet',
            operator: 'contains',
            value: 'playerWallet',
          },
        ],
      },
    ],
    ...defaults,
  },
}
