import { Stations } from '../../../types/state'

export const StationsInitState: Stations = {
  stationexample: {
    name: '',
    room: '',
    roles: [],
    occupant: '',
    swap: '',
    schedule: '',
    ward: false,
    fallback: false,
    onScreen: false,
  },
}

export const RoomsInitFallbacks = {
  swaps: {},
  stations: {
    admin1_passer: '',
    security_passer: '',
    baggage_passer: '',
    alley2_passer: '',
    alley4_passer: '',
    viplobby_passer: '',
    reception_unplaced: '',
    grounds_unplaced: '',
    customs_unplaced: '',
    store_unplaced: '',
    dorms_unplaced: '',
    loading_outside1: '',
    viplobby_outside1: '',
    security_outside1: '',
    infirmary_outside1: '',
    dorms_outside1: '',
  },
}
