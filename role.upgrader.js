var roleUpgrader = {

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
    } else if (creep.memory.task == "harvest") {
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
    else {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
	}
};

module.exports = roleUpgrader;
