/**
 * Main file from which everything else gets called
 *
 */

/*
  Import all external files.
  Do these imports have an impact on performance?
*/
var spawnSimple = require("spawn.simple");
var roleBuilder = require("role.builder");
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");

/**
 * Main game loop. Executed once every tick.
 *
 * @return {void}
 */
module.exports.loop = function () {
  clearCreepMemory(); // Remove all Memory data associated with dead creeps
  clearSpawnMemory(); // Remove all Memory data associated with destryed spawns
  adoptOrphanCreeps(); // Find any creeps not assigned to a spawn and assign them to their nearest spawn

  // Assign orders to all spawns
  for (var name in Game.spawns) { // For every spawn
    var spawn = Game.spawns[name];
    if (!spawn.memory.type) // If the spawn does not have a defined type in Memory
      spawn.memory.type = "simple"; // Assign the type to "simple"

    switch(spawn.memory.type) { // Execute instructions based on type
      case "simple":
        spawnSimple.run(spawn);
        break;
    }
  }

  // Assign orders to all creeps
  for (var name in Game.creeps) { // For each creep
    var creep = Game.creeps[name];
    switch(creep.memory.role) { // Execute instructions based on type
      case "builder": roleBuilder.run(creep);
        break;
      case "harvester": roleHarvester.run(creep);
        break;
      case "upgrader": roleUpgrader.run(creep);
        break;
    }
  }
}

/**
 * Look in Memory object and remove orphaned creep data
 *
 * @return {void}
 */
var clearCreepMemory = function() {
  for(var name in Memory.creeps) { // Look through all creep memory
    if(!Game.creeps[name]) { // If there is data in Memory for a creep that no longer exists
      delete Memory.creeps[name]; // Delete the data from Memory
    }
  }
};

/**
 * Look in Memory object and remove orphaned spawn data
 *
 * @return {void}
 */
 var clearSpawnMemory = function() {
   for(var name in Memory.spawns) { // Look through all creep memory
     if(!Game.spawns[name]) { // If there is data in Memory for a creep that no longer exists
       delete Memory.spawns[name]; // Delete the data from Memory
     }
   }
 };

/**
 * Find creeps without a parent spawn and assign them to the nearest spawn
 *
 * @return {void}
 */
var adoptOrphanCreeps = function() {
  //Get a list of creeps that either A) Has no spawn defined, or B) Has a spawn defined that does not esist in the list of valid spawns
  var orphanCreeps = _.filter(Game.creeps, (creep) => (_.isUndefined(creep.memory.spawn) || _.isUndefined(Game.spawns[creep.memory.spawn])));

  if (orphanCreeps.length > 0) { // If there are any orphaned creeps found
    _.forEach(orphanCreeps, function(creep){creep.memory.spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS).name}); // Find the spawn that is closes to that creep and assign the creep to that spawn
  }
};
