/**
 * Governs the harvester behavior of SCVs
 *
 * @type {Object}
 */
var roleHarvester = {

  /**
   * Instructions to be run every game tick
   *
   * @param  {creep} creep The creep that is being processed
   * @return {void}
   */
  run: function(creep) {
    if (!creep.memory.task) // If the creep does not have a task
      creep.memory.task = "harvest"; // Assign the creep's task to harvest

    if (creep.memory.task == "harvest" && creep.carry.energy == creep.carryCapacity) { // If the creep's task is to harvest and it is full
      creep.memory.task = "deliver"; // Set the creep's task to deliver
    }
    if (creep.memory.task == "deliver" && creep.carry.energy == 0) { // If the creep's task is to deliver and it is empty
      creep.memory.task = "harvest"; // Set the creep's task to harvest
    }

    if (creep.memory.task == "return") { // If the creep's task is to return
      creep.moveTo(Game.spawns[creep.memory.spawn]); // Move to the creep's parent spawn location
    } else if (creep.memory.task == "harvest") { // If harvesting
      // Look for dropped energy first
      var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (resource) => resource.resourceType == RESOURCE_ENERGY}); // An array of all dropped energy
      if (droppedEnergy.length > 0) { // If there is dropped energy in the room
        if (creep.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) { // Pick up the dropped energy or move to it
          creep.moveTo(droppedEnergy[0]);
        }
      } else { // If there is no dropped energy, then move on to harvesting sources
        var targetSource = creep.pos.findClosestByPath(FIND_SOURCES); // Find the closest energy source
        if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) { // Harvest from the source or move to it
          creep.moveTo(targetSource);
        }
      }
    } else { // If not harvesting
      // Look for supply jobs
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
      } else { // If there are no supply jobs, check for build jobs
        var buildJobs = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (buildJobs.length > 0) { // If there are build jobs, run the first one in the list
          if (creep.build(buildJobs[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(buildJobs[0]);
          }
        } else { // If there are no build jobs, upgrade the room controller
          if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
          }
        }
      }
    }
	}
};

module.exports = roleHarvester;
