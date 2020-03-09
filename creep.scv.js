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

const {
  SCV_TASK,
  PATH_STYLE
} = require("constants");

function run(creep, spawn) {
  assignTask(creep);

  switch(creep.memory.t) {
    case SCV_TASK.HARVEST:
      harvest(creep);
      break;
    case SCV_TASK.DELIVER:
      deliver(creep);
      break;
    case SCV_TASK.RETURN:
      returnHome(creep);
      break;
    case SCV_TASK.RENEW:
      renew(creep, spawn);
      break;
  }
}

/**
 * Set a creep's task
 *
 * @param  {creep} creep The creep being processed
 * @return {void}
 */
function assignTask(creep, task) {
  if (creep.ticksToLive < 100 && creep.memory.t !== SCV_TASK.RENEW) { // If the creep is close to death
    creep.memory.t = SCV_TASK.RENEW; // Send the creep home so that it can be renewed
    creep.say("Renew");
  } else if (task && Object.values(TASK).includes(task) && creep.memory.t !== SCV_TASK.RETURN) { // If a task is supplied and exists in the object
    creep.memory.t = task; // Assign the given task to the creep
    creep.say(
      task === SCV_TASK.HARVEST
      ? "Harvest"
      : task === SCV_TASK.DELIVER
        ? "Deliver"
        : task === SCV_TASK.RETURN
          ? "Return"
          : task === SCV_TASK.RENEW
            ? "Renew"
            : "Unknown"
      );
  } else if (!creep.memory.t) { // If the creep does not have a task
    creep.memory.t = SCV_TASK.HARVEST; // Set the creep's task to harvest
    creep.say("Harvest");
  } else if (creep.memory.t !== SCV_TASK.HARVEST && creep.memory.t !== SCV_TASK.RETURN && creep.store[RESOURCE_ENERGY] === 0) { // If the creep is not harvesting, not returning, and is empty
    creep.memory.t = SCV_TASK.HARVEST; // Set the creep's task to harvest
    creep.say("Harvest");
  } else if (creep.memory.t !== SCV_TASK.DELIVER && creep.memory.t !== SCV_TASK.RETURN && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) { // If the creep is not delivering, not returning, and full
    creep.memory.t = SCV_TASK.DELIVER; // Set the creep's task to deliver
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
    creep.moveTo(Game.spawns[creep.memory.sp], { visualizePathStyle: PATH_STYLE.RETURN });
  else
    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0], { visualizePathStyle: PATH_STYLE.RETURN });
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
          creep.moveTo(source, { visualizePathStyle: PATH_STYLE.HARVEST });
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

/**
 * Deliver carried energy to the assigned target.
 * 
 * @param {Creep} creep The creep being processed
 */
function deliver(creep) {
  if (creep.memory.ta) {
    let target = Game.getObjectById(creep.memory.ta);
    if (target) {
      let code = creep.transfer(target, RESOURCE_ENERGY);
      if (code !== OK) {
        if (code === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: PATH_STYLE.DELIVER });
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

/**
 * Return home and ask to be renewed
 * 
 * @param {Creep} creep The creep being processed
 * @param {Spawn} spawn The spawn tasking the creep
 */
function renew(creep, spawn) {
  let code = spawn.renewCreep(creep);
  if (code !== OK) {
    if (code === ERR_NOT_IN_RANGE) {
      returnHome(creep);
    } else if (code === ERR_NOT_ENOUGH_ENERGY) {
      console.log(creep.name + " - Spawn does not have enough energy. Waiting.");
    } else if (code === ERR_BUSY) {
      console.log(creep.name + " - Spawn busy. Waiting.");
    } else if (code === ERR_FULL) {
      console.log(creep.name + " - Renewed.");
      assignTask(creep, SCV_TASK.HARVEST);
    } else {
      console.log(creep.name + " - Attempting to renew produced error code: " + code);
    }
  }
}

module.exports = {
  assignTask: assignTask,
  run: run
};