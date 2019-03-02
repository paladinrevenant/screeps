var roleHarvester = require("role.harvester");

module.exports.loop = function () {
    clearCreepMemory();

	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

	if(harvesters.length < 2) {
    var newName = 'Harvester' + Game.time;
    // console.log('Spawning new harvester: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
      {memory: {role: 'harvester'}});
  }

  // Assign orders to all creeps
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    switch(creep.memory.role) {
      case "harvester": roleHarvester.run(creep);
        break;
    }
  }
}

var clearCreepMemory = function() {
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name];
      // console.log('Clearing non-existing creep memory:', name);
    }
  }
}
