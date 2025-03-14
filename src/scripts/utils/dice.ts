interface bags {
  [key: string]: bag
}
interface bag {
  success: number
  fail: number
  full_success: number
  full_fail: number
  reset_on_success: boolean
}
//const dt = math.randomseed(os.time())
export const bags: bags = {}
export const tables = {}
export const ROLLODDS: { [key: string]: number } = {
  '44': 38,
  '45': 32,
  '46': 25,
  '47': 22,
  '48': 19,
  '49': 17,
  '410': 15,
  '411': 14,
  '412': 13,
  '54': 48,
  '55': 39,
  '56': 34,
  '57': 30,
  '58': 25,
  '59': 23,
  '510': 20,
  '511': 19,
  '512': 17,
  '64': 58,
  '65': 50,
  '66': 42,
  '67': 37,
  '68': 31,
  '69': 28,
  '610': 25,
  '611': 23,
  '612': 21,
  '74': 64,
  '75': 57,
  '76': 48,
  '77': 44,
  '78': 38,
  '79': 34,
  '710': 30,
  '711': 28,
  '712': 25,
  '84': 69,
  '85': 63,
  '86': 56,
  '87': 50,
  '88': 44,
  '89': 40,
  '810': 35,
  '811': 32,
  '812': 29,
  '94': 72,
  '95': 67,
  '96': 61,
  '97': 55,
  '98': 50,
  '99': 45,
  '910': 40,
  '911': 37,
  '912': 34,
  '104': 75,
  '105': 70,
  '106': 65,
  '107': 60,
  '108': 55,
  '109': 50,
  '1010': 45,
  '1011': 42,
  '1012': 38,
  '114': 77,
  '115': 73,
  '116': 68,
  '117': 63,
  '118': 59,
  '119': 55,
  '1110': 50,
  '1111': 46,
  '1112': 42,
  '124': 79,
  '125': 75,
  '126': 71,
  '127': 67,
  '128': 63,
  '129': 59,
  '1210': 54,
  '1211': 50,
  '1212': 46,
}

export function set_up_rng(s?: number) {
  const seed = s != null ? s : 100000000000000 * (socket.gettime() % 1)
  math.randomseed(seed)
  for (let i = 20; i-- !== 0; ) {
    math.random()
  }

  return seed
}

export function flip_coin() {
  return math.random() > 0.5
}

export function roll_dice(num_sides = 6, num_dice = 1, modifier = 0) {
  let result = modifier

  for (let i = num_dice; i-- !== 0; ) {
    result = result + math.random(num_sides)
  }

  return result
}

export function rollSpecialDice(
  num_sides = 4,
  advantage = false,
  num_dice = 2,
  num_results = 1
) {
  /**     num_sides = num_sides or 6
    num_dice = num_dice or 2
    num_results = num_results or 1
*/
  const rolls = []
  let num_rolls = 0
  let roll = null

  let replace_value = null
  let replace_id = null

  for (let i = num_dice; i-- !== 0; ) {
    roll = roll_dice(num_sides, 1)

    num_rolls = rolls.length

    if (num_rolls < num_results) {
      rolls.push(roll)
    } else if (advantage) {
      replace_value = num_sides
      replace_id = null
      for (let j = num_rolls; j-- !== 0; ) {
        if (roll > rolls[j] && rolls[j] < replace_value) {
          replace_id = j
          replace_value = rolls[j]
        }
      }
      if (replace_id !== null) {
        rolls[replace_id] = roll
      } else replace_value = 0
      replace_id = null
      for (let j = num_rolls; j-- !== 0; ) {
        if (roll < rolls[j] && rolls[j] > replace_value) {
          replace_id = j
          replace_value = rolls[j]
        }
      }
      if (replace_id !== null) {
        rolls[replace_id] = roll
      }
    }
  }

  let result = 0
  for (let i = num_rolls; i-- !== 0; ) {
    result = result + rolls[i]
  }

  return result
}

export function roll_custom_dice(num_dice = 1, sides: Array<[number, number]>) {
  // num_dice = num_dice or 1

  let result = 0
  let total_weight = 0
  const num_sides = sides.length

  //count up the total weight
  for (let i = num_sides; i-- !== 0; ) {
    total_weight = total_weight + sides[i][1]
  }

  let weight_result = 0
  let processed_weight = 0

  for (let i = num_dice; i-- !== 0; ) {
    weight_result = math.random() * total_weight

    //find and return the resulting value
    processed_weight = 0
    for (let i = num_sides; i-- !== 0; ) {
      if (weight_result <= sides[i][0] + processed_weight) {
        result = result + sides[i][1]
        break
      } else {
        processed_weight = processed_weight + sides[i][0]
      }
    }
  }

  return result
}

export function bag_create(
  id: string,
  num_success: number,
  num_fail: number,
  reset_on_success: boolean
) {
  bags[id] = {
    success: num_success,
    fail: num_fail,
    full_success: num_success,
    full_fail: num_fail,
    reset_on_success: reset_on_success,
  }
}

export function bag_draw(id: string) {
  if (bags[id] == undefined) {
    return false
  }
  let result = false
  const roll = math.random(1, bags[id].success + bags[id].fail)

  if (roll > bags[id].fail) {
    result = true
    if (bags[id].reset_on_success == true) {
      bag_reset(id)
    } else {
      bags[id].success = bags[id].success - 1
    }
  } else {
    result = false
    bags[id].fail = bags[id].fail - 1
  }

  return result
}

export function bag_reset(id: string) {
  if (bags[id] == undefined) {
    return false
  }

  bags[id].success = bags[id].full_success
  bags[id].fail = bags[id].full_fail
}
