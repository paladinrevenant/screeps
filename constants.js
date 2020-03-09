module.exports = {
	SCV_TASK: {
		HARVEST: 0,
		DELIVER: 1,
		RETURN: 2,
		RENEW: 3
	},
	SCV_ROLE: {
		HARVESTER: 0,
		UPGRADER: 1,
		BUILDER: 2
	},
	SCV_PROTOTYPE = [
		[WORK, CARRY, MOVE, MOVE], // Cost: 250
		[WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE], // Cost: 500
		[WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE] // Cost: 800 - Made to move on roads
	],
	PATH_STYLE = {
		RETURN: {
			stroke: "#FF0000"
		},
		HARVEST: {
			stroke: "#00A000"
		},
		DELIVER: {
			stroke: "#0C86F2"
		}
	},
	EXTENSION_LOCATIONS: [ // Preferred placement of extensions, relative to Spawn (x,y)
		[-1,-2],[1,-2],[-2,-1],[2,-1],
		[-2,1],[2,1],[-1,2],[1,2],
		[-1,-3],[1,-3],[-3,-1],[3,-1],
		[-3,1],[3,1],[-1,3],[1,3],
		[-2,-3],[2,-3],[-3,-2],[3,-2],
		[-3,2],[3,2],[-2,3],[2,3],
		[-1,-4],[1,-4],[-4,-1],[4,-1],
		[-4,1],[4,1],[-1,4],[1,4],
		[-2,-4],[2,-4],[-4,-2],[4,-2],
		[-4,2],[4,2],[-2,4],[2,4],
		[-3,-4],[3,-4],[-4,-3],[4,-3],
		[-4,3],[4,3],[-3,-4],[3,4],
		[-1,6],[1,6],[-1,7],[1,7],
		[-2,6],[2,6],[-2,7],[2,7],
		[-3,6],[3,6],[-3,7],[3,7],
		[-6,-1],[-6,1],[-7,-1],[-7,1],
		[-6,-2],[-6,2],[-7,-2],[-7,2],
		[-6,-3],[-6,3],[-7,-3],[-7,3],
		[6,-1],[6,1],[7,-1],[7,1],
		[6,-2],[6,2],[7,-2],[7,2],
		[6,-3],[6,3],[7,-3],[7,3],
		[-1,-6],[1,-6],[-1,-7],[1,-7],
		[-2,-6],[2,-6],[-2,-7],[2,-7],
		[-3,-6],[3,-6],[-3,-7],[3,-7]
	],
	TOWER_LOCATIONS: [ // Preferred placement of towers, relative to Spawn (x,y)
		[-4,-7],[7,-4],[4,7],[-7,4],
		[4,-7],[7,4],[-4,7],[-7,-4]
	],
	MAX_EXTENSIONS: [0, 0, 5, 10, 20, 30, 40, 50, 60], // Maximum number of extensions based on room level
	MAX_TOWERS: [0, 0, 0, 1, 1, 2, 2, 3, 6] // Maximum number of towers based on room level

};