var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (!creep.memory.task)
      creep.memory.task = "harvest";

    if (creep.memory.task == "harvest" && creep.carry.energy == creep.carryCapacity) {
      creep.memory.task = "deliver";
      creep.say('🔄 deliver');
    }
    if (creep.memory.task == "deliver" && creep.carry.energy == 0) {
      creep.memory.task = "harvest";
      creep.say('🔄 harvest');
    }

    if (creep.memory.task == "return") {
      creep.moveTo(Game.spawns[creep.memory.spawn]);
    } else if (creep.memory.task == "harvest") { // If harvesting
      // Look for dropped energy first
      var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (resource) => resource.resourceType == RESOURCE_ENERGY});
      if (droppedEnergy.length > 0) {
        if (creep.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedEnergy[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      } else { // If there is no dropped energy, then move on to harvesting sources
        var targetSource = creep.pos.findClosestByPath(FIND_SOURCES);
        if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    } else { // If not harvesting
      var supplyJobs = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
                  structure.structureType == STRUCTURE_SPAWN ||
                  structure.structureType == STRUCTURE_TOWER) &&
                  structure.energy < structure.energyCapacity;
        }
      });
      if (supplyJobs.length > 0) { // If there are supply jobs, run them
        if (creep.transfer(supplyJobs[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(supplyJobs[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else { // If there are no supply jobs, check for build jobs
        var buildJobs = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (buildJobs.length > 0) {
          if (creep.build(buildJobs[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(buildJobs[0], {visualizePathStyle: {stroke: '#ffffff'}});
          }
        } else { // If there are no build jobs, upgrade the room controller
          if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      }
    }
	}
};

module.exports = roleHarvester;
