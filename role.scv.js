/**
 * Governs the general behavior of SCVs
 *
 * !! NOT CURRENTLY USED !!
 *
 * @type {Object}
 */
var roleScv = {
  /**
   * Set a creep's task
   *
   * @param  {creep} creep The creep being processed
   * @return {void}
   */
  assignTask: function(creep) {
    if (!creep.memory.task) // If the creep does not have a task
      creep.memory.task = "harvest"; // Set th creep's task to harvest

    if (creep.ticksToLive < 100) // If the creep is close to death
      creep.memory.task = "return"; // Send the creep home so that it can be renewed

    if (creep.memory.task != "harvest" && creep.memory.task != "return" && creep.carry.energy == 0) { // If the creep is not harvesting, not returning, and is empty
      creep.memory.task = "harvest"; // Set the creep's task to harvest
    }
  }


};

module.exports = roleScv;
