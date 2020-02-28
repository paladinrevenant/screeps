/**
 * Governs the general behavior of SCVs
 *
 * !! NOT CURRENTLY USED !!
 * 
 * Memory:
 *   t  - Task: The task that the creep is supposed to carry out.
 *   r  - Role: The role assigned to the creep.
 *   sp - Spawn: The spawn that the creep is assigned to.
 *   so - Source: The source that the creep is assigned to gather from.
 *   ta - Target: The id of the target that the creep will delver energy to.
 *   ts - Temporary Source: The ID of an object that should be gathered from before returning to normal operation.
 *
 * @type {Object}
 */

const TASK = {
  HARVEST: 0,
  DELIVER: 1,
  RETURN: 2
};

const ROLE = {
  HARVESTER: 0,
  UPGRADER: 1,
  BUILDER: 2
};

const SCV_PROTOTYPE = [
  [WORK, CARRY, MOVE, MOVE], // Cost: 250
  [WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE], // Cost: 500
  [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE] // Cost: 800 - Made to move on roads
];

const returnPathStyle = {
  stroke: "#FF0000"
};

const harvestPathStyle = {
  stroke: "#00A000"
};

const deliverPathStyle = {
  stroke: "#0C86F2"
};

/**
 * Set a creep's task
 *
 * @param  {creep} creep The creep being processed
 * @return {void}
 */
function assignTask(creep, task) {
  if (creep.ticksToLive < 100 && creep.memory.t !== TASK.RETURN) { // If the creep is close to death
    creep.memory.t = TASK.RETURN; // Send the creep home so that it can be renewed
    creep.say("Return")
  } else if (task && Object.values(TASK).includes(task) && creep.memory.t !== TASK.RETURN) { // If a task is supplied and exists in the object
    creep.memory.t = task; // Assign the given task to the creep
    creep.say(
      task === TASK.HARVEST
      ? "Harvest"
      : task === TASK.DELIVER
        ? "Deliver"
        : task === TASK.RETURN
          ? "Return"
          : "Unknown"
      );
  } else if (!creep.memory.t) { // If the creep does not have a task
    creep.memory.t = TASK.HARVEST; // Set the creep's task to harvest
    creep.say("Harvest");
  } else if (creep.memory.t !== TASK.HARVEST && creep.memory.t !== TASK.RETURN && creep.store[RESOURCE_ENERGY] === 0) { // If the creep is not harvesting, not returning, and is empty
    creep.memory.t = TASK.HARVEST; // Set the creep's task to harvest
    creep.say("Harvest");
  } else if (creep.memory.t !== TASK.DELIVER && creep.memory.t !== TASK.RETURN && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) { // If the creep is not delivering, not returning, and full
    creep.memory.t = TASK.DELIVER; // Set the creep's task to deliver
    creep.say("Deliver");
  }
}

/**
 * Return to the assigned Spawn, usually to be renewed.
 * 
 * @param {Creep} creep The creep being processed
 */
function returnHome(creep) {
  if (creep.memory.sp)
    creep.moveTo(Game.spawns[creep.memory.sp], { visualizePathStyle: returnPathStyle });
  else
    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0], { visualizePathStyle: returnPathStyle });
}

/**
 * Travel to the assigned source and harvest from it.
 * If a temporary source has been assigned, gather from that one first.
 * 
 * @param {Creep} creep The creep being processed
 */
function harvest(creep) {
  if (creep.memory.so) {
    let source = creep.memory.ts ? Game.getObjectById(creep.memory.ts) : Game.getObjectById(creep.memory.so);

    if (source) {
      let code = creep.harvest(source);
      if (code !== OK) {
        if (code === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: harvestPathStyle });
        } else if (cose === ERR_NOT_ENOUGH_RESOURCES) {
          // Source is empty, just wait.
        } else if (code === ERR_INVALID_TARGET) {
          console.log(creep.name + " - Source not valid");
          //TODO: request new source
        } else {
          console.log(creep.name + " - Attempting to harvest produced error code: " + code);
        }
      }
    } else {
      console.log(creep.name + " - Source does not exist");
      //TODO: request new source
    }
  } else {
    console.log(creep.name + " - No source specified");
    //TODO: request new source
  }
}

function deliver(creep) {
  if (creep.memory.ta) {
    let target = Game.getObjectById(creep.memory.ta);
    if (target) {
      let code = creep.transfer(target, RESOURCE_ENERGY);
      if (code !== OK) {
        if (code === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: deliverPathStyle });
        } else if (code === ERR_INVALID_TARGET) {
          console.log(creep.name + " - Target cannot accept energy");
          //TODO: request new target
        } else if (code === ERR_FULL) {
          console.log(creep.name + " - Target full");
          //TODO: request new target
        } else {
          console.log(creep.name + " - Attempting to transfer produced error code: " + code);
        }
      }
    } else {
      console.log(creep.name + " - Target does not exist");
      //TODO: request new target
    }
  } else {
    console.log(creep.name + " - No target specified");
    //TODO: request new target
  }
}

module.exports = {
  assignTask: assignTask,
  TASK: TASK,
  ROLE: ROLE,
  SCV_PROTOTYPE: SCV_PROTOTYPE
};