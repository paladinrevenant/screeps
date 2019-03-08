/**
 * Governs the builder behavior of SCVs
 *
 * @type {Object}
 */
var roleBuilder = {

  /**
   * Instructions to be run every game tick
   *
   * @param  {creep} creep The creep that is being processed
   * @return {void}
   */
  run: function(creep) {
    if (!creep.memory.task) // If the creep does not have a current task
      creep.memory.task = "harvest"; // Assign it to harvest energy

    if (creep.memory.task == "harvest" && creep.carry.energy == creep.carryCapacity) { // If the creep's task is to harvest, and it's capacity is full
      creep.memory.task = "deliver"; // Set the creep's task to deliver
    }
    if (creep.memory.task == "deliver" && creep.carry.energy == 0) { // If the creep's task is to deliver, and it is empty
      creep.memory.task = "harvest"; // Set the creep's task to harvest
    }

    if (creep.memory.task == "return") { // If the creep's task is set to return
      creep.moveTo(Game.spawns[creep.memory.spawn]); // Move back to the creep's parent spawn
    } else if (creep.memory.task == "harvest") { // If harvesting
      var sources = creep.room.find(FIND_SOURCES); // Find all the sources in the room
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) { // Attempt to harvest from the first source in the list, if it is out of range
        creep.moveTo(sources[0]); // Move to the first source in the list
      }
    } else { // If not harvesting
      var buildJobs = creep.room.find(FIND_CONSTRUCTION_SITES); // Look for any construction sites
      if(buildJobs.length > 0) { // If there are build jobs, then do the first one in the list
        if (creep.build(buildJobs[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(buildJobs[0]);
        }
      } else { // If there are no build jobs, look for supply jobs
        var supplyJobs = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
                  structure.structureType == STRUCTURE_SPAWN ||
                  structure.structureType == STRUCTURE_TOWER) &&
                  structure.energy < structure.energyCapacity;
                }
        });
        if (supplyJobs.length > 0) { // If there are supply jobs, run the first one in the list
          if (creep.transfer(supplyJobs[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(supplyJobs[0]);
          }
        } else { // If there are no supply jobs, upgrade the room controller
          if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
          }
        }
      }
    }
	}
};

module.exports = roleBuilder;
