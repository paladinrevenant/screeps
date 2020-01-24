/**
 * Main file from which everything else gets called
 *
 */

/*
  Import all external files.
  Do these imports have an impact on performance?
*/
var spawnDriver = require("driver.spawn");
var roleBuilder = require("role.builder");
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");

/**
 * Main game loop. Executed once every tick.
 *
 * @return {void}
 */
module.exports.loop = function () {
  doPeriodicChecks(); // Check for orphaned data and IDs that should be in lists, but aren't



  // Assign orders to all spawns
  for (var name in Game.spawns) { // For every spawn
    var spawn = Game.spawns[name];
      spawnDriver.run(spawn);
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

/**
 * This function decides which housekeeping checks to do on each tick.
 *
 *   We don't want to check everything every tick, and we don't want to check
 * everything all at once either.
 *   This function uses an array to store the ID of each Spawn and an iterator
 * to go through the list of Spawns.
 *   Every tick, the iterator is increased and the array is checked to see if it
 * has a Spawn ID at that index. If there is a Spawn ID at that index, then that
 * Spawn's periodic checks are run. This staggers the checks, so that only one
 * Spawn runs its checks on the same tick.
 *   The iterator is forced to climb to at least 10 before it is reset to 0.
 * This way, even at early stages, the periodic checks are only run at most
 * every 10 ticks.
 *   The Spawn ID array contains a dummy value in index 0. This is a special
 * case. When the iterator is 0, system-wide checks will run looking for
 * orphaned Creeps, Orphaned data in Memory, and Spawns that are not in the
 * list.
 *
 * @return {void}
 */
const doPeriodicChecks = function() {
  if (_.isUndefined(Memory.periodicSpawns)) // If the list of spawns to periodically check does not exist
    Memory.periodicSpawns = ["dummy"]; // Create the list with a dummy value in the 0 index

  if (_.isUndefined(Memory.periodicTimer)) // If the periodic check timer is not defined
    Memory.periodicTimer = 0; // Create the periodic check timer and set it to 0
  else if (Memory.periodicTimer == 10 && Memory.periodicTimer == Memory.periodicSpawns.length) // If the periodic check timer is at least 10 and at least the length ofthe spawn array
    Memory.periodicTimer = 0; // Set the periodic check timer back to 0
  else // Otherwise, the periodic check timer exist and is not at the end of the list
    Memory.periodicTimer++; // Increment the periodic check timer

  if (Memory.periodicTimer === 0)
    doGlobalChecks();
  else if (_.isUndefined(Memory.periodicSpawns[Memory.periodicTimer]))
    Memory.periodicSpawns.splice(Memory.periodicTimer, 1);
  else if (_.isNull(Game.getObjectById(Memory.periodicSpawns[Memory.periodicTimer])))
    Memory.periodicSpawns.splice(Memory.periodicTimer, 1);
  else
    spawnDriver.doPeriodicChecks(Game.getObjectById(Memory.periodicSpawns[Memory.periodicTimer]));
  //TODO: Finish this.
};

/**
 * Check global memory for orphaned or missing data.
 *
 * @return {void}
 */
const doGlobalChecks = function() {
  clearCreepMemory(); // Remove all Memory data associated with dead creeps
  clearSpawnMemory(); // Remove all Memory data associated with destryed spawns
  adoptOrphanCreeps(); // Find any creeps not assigned to a spawn and assign them to their nearest spawn
  prunePeriodicSpawns(); // Remove dead Spawns from the list of Spawns to check.
}

/**
 * Look in Memory object and remove orphaned creep data
 *
 * @return {void}
 */
const clearCreepMemory = function() {
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
const clearSpawnMemory = function() {
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

const prunePeriodicSpawns = function() {
  for (let a = 1; a < Memory.periodicSpawns; a++) {

  }
};
