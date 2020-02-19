/**
 * Main file from which everything else gets called
 *
 * Memory:
 *   tc - Tick Count: The counter used for spreading out calculations so things don't all happen together.
 *   ps - Periodic Spawns: An array of arrays. Each array holds the names of the spawns that will be tended on that tick.
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
  tickFunctions[Memory.tc]();
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
  assignPeriodicSpawns();
}

function execTick1() {
  clearSpawnMemory();
  execPeriodicChecks(1);
}

function execTick2() {
  adoptOrphanCreeps();
  execPeriodicChecks(2);
}

function execTick3() {
  execPeriodicChecks(3);
}

function execTick4() {
  execPeriodicChecks(4);
}

function execTick5() {
  execPeriodicChecks(5);
}

function execTick6() {
  execPeriodicChecks(6);
}

function execTick7() {
  execPeriodicChecks(7);
}


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
  if (typeof Memory.tc != "number" ||
      Memory.tc < 0 ||
      Memory.tc > 6) {
    Memory.tc = 0;
  } else {
    Memory.tc++;
  }
}

function assignPeriodicSpawns() {
  let unassignedSpawns = [];

  if (!Memory.ps) {
    Memory.ps = [[],[],[],[],[],[],[],[]];
  }

  for (name in Game.spawns) {
    let found = false;

    for (let a = 0; a < 8; a++) {
      if (Memory.ps[a].includes(name)) {
        found = true;
        break;
      }
    }

    if (!found)
      unassignedSpawns.push(name);
  }

  if (unassignedSpawns.length > 0) {
    for (let b = 0, l = unassignedSpawns.length; b < l; b++) {
      let idx = 1;
      let count = Memory.ps[1].length;

      for (let c = 2; c < 8; c++)
        if (Memory.ps[c].length < count)
          idx = c;
      
      Memory.ps[idx].push(unassignedSpawns[b]);
    }
  }
}

function execPeriodicChecks(tick) {
  for (let a = 0; a < Memory.ps[tick].length; a++) {
    let name = Memory.ps[tick][a];
    spawnDriver.periodicChecks(Game.spawns[name]);
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
