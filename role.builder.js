var roleBuilder = {

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
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    } else { // If not harvesting
      var buildJobs = creep.room.find(FIND_CONSTRUCTION_SITES);
      if(buildJobs.length > 0) { // If there are build jobs, then do them
        if (creep.build(buildJobs[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(buildJobs[0], {visualizePathStyle: {stroke: '#ffffff'}});
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
        if (supplyJobs.length > 0) { // If there are supply jobs, run them
          if (creep.transfer(supplyJobs[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(supplyJobs[0], {visualizePathStyle: {stroke: '#ffffff'}});
          }
        } else { // If there are no supply jobs, upgrade the room controller
          if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      }
    }
	}
};

module.exports = roleBuilder;
