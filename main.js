/**
 * Main file from which everything else gets called
 *
 */

/*
  Import all external files.
  Do these imports have an impact on performance?
*/
var spawnDriver = require("driver.spawn");

/**
 * Main game loop. Executed once every tick.
 *
 * @return {void}
 */
module.exports.loop = function () {
  advanceTickCount();
  execEveryTick();
  tickFunctions[Memory.tickCount]();
}

function execEveryTick() {
  // Assign orders to all spawns
  for (var name in Game.spawns) { // For every spawn
    var spawn = Game.spawns[name];
      spawnDriver.run(spawn);
  }
}

function execTick0() {
  clearCreepMemory();
}

function execTick1() {
  clearSpawnMemory();
}

function execTick2() {
  adoptOrphanCreeps();
}

function execTick3() {}
function execTick4() {}
function execTick5() {}
function execTick6() {}
function execTick7() {}


/**
 * Look in Memory object and remove orphaned creep data
 *
 * @return {void}
 */
function clearCreepMemory() {
  for(var name in Memory.creeps) { // Look through all creep memory
    if(!Game.creeps[name]) { // If there is data in Memory for a creep that no longer exists
      delete Memory.creeps[name]; // Delete the data from Memory
    }
  }
};

/**
 * Look in Memory object and remove orphaned spawn data
 *
 * @return {void}
 */
function clearSpawnMemory() {
  for(var name in Memory.spawns) { // Look through all creep memory
    if(!Game.spawns[name]) { // If there is data in Memory for a creep that no longer exists
      delete Memory.spawns[name]; // Delete the data from Memory
    }
  }
};

/**
 * Find creeps without a parent spawn and assign them to the nearest spawn
 *
 * @return {void}
 */
var adoptOrphanCreeps = function() { //TODO: Reimplement this
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];

    if (!creep.memory.spawn || !Game.spawns[creep.memory.spawn]) {
      let nearestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);

      spawnDriver.adoptCreep(nearestSpawn, creep.name);
    }
  }
};

/**
 * Advances the Tick Count
 * Sets the Tick Count to 0 if it does not exist or is out of bounds
 * 
 * @return {void}
 */
function advanceTickCount() {
  if (typeof Memory.tickCount != "number" ||
      Memory.tickCount < 0 ||
      Memory.tickCount > 6) {
    Memory.tickCount = 0;
  } else {
    Memory.tickCount++;
  }
}

var tickFunctions = [
  execTick0,
  execTick1,
  execTick2,
  execTick3,
  execTick4,
  execTick5,
  execTick6,
  execTick7
];