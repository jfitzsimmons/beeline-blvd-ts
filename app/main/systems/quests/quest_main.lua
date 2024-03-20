local world = require "main.states.worldstate"
local tutorialcheckpoint = require "main.systems.quests.checkpoints.tutorial"

local M = {}

local checkpoints = {
	["tutorial"] = tutorialcheckpoint,
}

M.checkpoints = checkpoints

-- checks quest completion after interactions and turns
function M.address_quests(interval)
	local checkpoint = world.player.checkpoint:sub(1, -2)
	local quests = world.tasks.quests[checkpoint]
	for qk,qv in pairs(quests) do
		--print("quest passed?", qv.passed)
		if qv.passed == false then
			-- testjpf gettng sloppy?!?!?
			local quest_passed = true
			M.checkpoints[world.player.checkpoint:sub(1, -2)].checks[world.player.checkpoint](interval)
			for _,cv in pairs(qv.conditions) do 
				if cv.passed ~= true and cv.interval == interval then
					if cv.func(cv.args) == false then
						quest_passed = false
						--print(_,qk, "quest not complete", cv.func(cv.args))
					elseif cv.passed ~= nil then
						cv.passed = true
					end
				elseif cv.passed == false or cv.passed == nil then
					quest_passed = false
				end
			end
			if quest_passed == true then
				qv.passed = true
				print(qk, "quest COMPLETE!!!", qk)
			end
		end
	end
end

return M