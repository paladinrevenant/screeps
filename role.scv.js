/**
 * Governs the general behavior of SCVs
 *
 * !! NOT CURRENTLY USED !!
 * 
 * Memory:
 *   t  - Task: The task that the creep is supposed to carry out.
 *   sp - Spawn: The spawn that the creep is assigned to.
 *   so - Source: The source that the creep is assigned to gather from.
 *
 * @type {Object}
 */

const TASK = {
  HARVEST: 0,
  DELIVER: 1,
  RETURN: 2
};

const SCV_PROTOTYPE = [
  [WORK, CARRY, MOVE, MOVE], // Cost: 250
  [WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE], // Cost: 500
  [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE] // Cost: 800 - Made to move on roads
];

/**
 * Set a creep's task
 *
 * @param  {creep} creep The creep being processed
 * @return {void}
 */
function assignTask(creep, task) {
  if (creep.ticksToLive < 100) // If the creep is close to death
    creep.memory.t = TASK.RETURN; // Send the creep home so that it can be renewed

  else if (task && Object.values(TASK).includes(task)) // If a task is supplied and exists in the object
    creep.memory.t = task; // Assign the given task to the creep

  else if (!creep.memory.t) // If the creep does not have a task
    creep.memory.t = TASK.HARVEST; // Set the creep's task to harvest

  else if (creep.memory.t !== TASK.HARVEST && creep.memory.t !== TASK.RETURN && creep.store[RESOURCE_ENERGY] === 0) // If the creep is not harvesting, not returning, and is empty
    creep.memory.t = TASK.HARVEST; // Set the creep's task to harvest
  
  else if (creep.memory.t !== TASK.DELIVER && creep.memory.t !== TASK.RETURN && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) // If the creep is not delivering, not returning, and full
    creep.memory.t = TASK.DELIVER; // Set the creep's task to deliver
}

function returnHome(creep) {
  if (creep.memory.sp)
    creep.moveTo(Game.spawns[creep.memory.sp]);
  else
    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
}

function harvest(creep) {
  if (creep.memory.so) {
    let source = Game.getObjectById(creep.memory.so)
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.getObjectById(creep.memory.so));
    }
  }
}



module.exports = {
  assignTask: assignTask,
  TASK: TASK,
  SCV_PROTOTYPE: SCV_PROTOTYPE
};