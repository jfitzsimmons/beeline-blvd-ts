// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires

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

/** 
export function has_value(tab, val){
	for index, value in ipairs(tab) do
		if value == val {
			return true
		}
	}

	return false
)

export function deepcopy(orig){
	const orig_type = type(orig)
	const copy
	if orig_type == 'table' {
		copy = {}
		for orig_key, orig_value in next, orig, nil do
			copy[M.deepcopy(orig_key)] = M.deepcopy(orig_value)
		}
		setmetatable(copy, M.deepcopy(getmetatable(orig)))
	else -- number, string, boolean, etc
		copy = orig
	}
	return copy
}

export function get_index(tab, val){
	const index = nil
	for i, v in ipairs(tab) do 
		if (v == val) {
			index = i 
		}
	}
	return index
}

export function shuffle(tbl)	{
	for i = #tbl, 2, -1 do
		const j = math.random(i)
		tbl[i], tbl[j] = tbl[j], tbl[i]
	}
	return tbl
}





export function create_ipairs(ps){
	const ips = {}
	for k,v in pairs(ps) do 
		table.insert(ips, k)
	}
	return ips
}
*/
