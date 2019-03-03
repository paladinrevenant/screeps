var spawnSimple = require("spawn.simple");
var roleBuilder = require("role.builder");
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");

module.exports.loop = function () {
  // console.log("Running.");
  clearCreepMemory();
  adoptOrphanCreeps();

  // Do any processing necessary for the spawns
  for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    if (!spawn.memory.type)
      spawn.memory.type = "simple";

    switch(spawn.memory.type) {
      case "simple":
        spawnSimple.run(spawn);
        break;
    }
  }

  // Assign orders to all creeps
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    switch(creep.memory.role) {
      case "builder": roleBuilder.run(creep);
        break;
      case "harvester": roleHarvester.run(creep);
        break;
      case "upgrader": roleUpgrader.run(creep);
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
};

/** Find creeps without a parent spawn and assign them to the nearest spawn **/
var adoptOrphanCreeps = function() {
  var orphanCreeps = _.filter(Game.creeps, (creep) => (_.isUndefined(creep.memory.spawn) || _.isUndefined(Game.spawns[creep.memory.spawn])));
  // console.log("Orphan Creeps: " + orphanCreeps.length);

  if (orphanCreeps.length > 0) {
    _.forEach(orphanCreeps, function(creep){creep.memory.spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS).name});
  }
};
