/**
 * Governs the upgrader behavior of SCVs
 *
 * @type {Object}
 */
var roleUpgrader = {

  /**
   * Instructions to be run every game tick
   *
   * @param  {creep} creep The creep that is being processed
   * @return {void}
   */
  run: function(creep) {
    if (!creep.memory.task) // If the creep does not have a task
      creep.memory.task = "harvest"; // Set the creep's task to harvest

    if (creep.memory.task == "harvest" && creep.carry.energy == creep.carryCapacity) { // If the creep's task is set to harvest and it is full
      creep.memory.task = "deliver"; // Set the creep's task to deliver
    }
    if (creep.memory.task == "deliver" && creep.carry.energy == 0) { // If the creep's task is to deliver and it is empty
      creep.memory.task = "harvest"; // Set the creep's task to harvest
    }

    if (creep.memory.task == "return") { // If the creep's task is to return
      creep.moveTo(Game.spawns[creep.memory.spawn]); // Move the creep to its parent spawn's location
    } else if (creep.memory.task == "harvest") { // If the creep's task is to harvest
      var sources = creep.room.find(FIND_SOURCES); // Find a list of sources in the room
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) { // Harvest from the first source in the list or move to it
        creep.moveTo(sources[0]);
      }
    }
    else { // If not harvesting
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) { // Upgrade the room controller or move to it
        creep.moveTo(creep.room.controller);
      }
    }
	}
};

module.exports = roleUpgrader;
