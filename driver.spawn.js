/**
 * Spawn Driver
 * 
 * This contains code for controlling the spawns.
 * 
 * run() - The function that gets called every tick
 * 
 * memory:
 *   cl - Creep List: The list of creeps assigned to this spawn
 *   st - Stage: The stage that this spawn is operating in
 * 
 * Stages:
 *   0 - Just starting
 *   1 - Triggered when the first builder is created. Build spoke roads
 * 
 * O       O       O
 *  O  TEEEOEEET  O
 *   O  EEEOEEE  O
 *    O    O    O
 *  T  OEEEOEEEO  T
 *  EE EOEEOEEOE EE
 *  EE EEOEOEOEE EE
 *  EE EEEOOOEEE EE
 * OOOOOOOOSOOOOOOOO
 *  EE EEEOOOEEE EE
 *  EE EEOEOEOEE EE
 *  EE EOEEOEEOE EE
 *  T  OEEEOEEEO  T
 *    O    O    O
 *   O  EEEOEEE  O
 *  O  TEEEOEEET  O
 * O       O       O
 * 
 */
var towerDriver = require("driver.tower");
var roleBuilder = require("role.builder");
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");

/**
 Preferred placement of extensions, relative to Spawn (x,y)
*/
const extensionLocations = [
 [-1,-2],[1,-2],[-2,-1],[2,-1],
 [-2,1],[2,1],[-1,2],[1,2],
 [-1,-3],[1,-3],[-3,-1],[3,-1],
 [-3,1],[3,1],[-1,3],[1,3],
 [-2,-3],[2,-3],[-3,-2],[3,-2],
 [-3,2],[3,2],[-2,3],[2,3],
 [-1,-4],[1,-4],[-4,-1],[4,-1],
 [-4,1],[4,1],[-1,4],[1,4],
 [-2,-4],[2,-4],[-4,-2],[4,-2],
 [-4,2],[4,2],[-2,4],[2,4],
 [-3,-4],[3,-4],[-4,-3],[4,-3],
 [-4,3],[4,3],[-3,-4],[3,4],
 [-1,6],[1,6],[-1,7],[1,7],
 [-2,6],[2,6],[-2,7],[2,7],
 [-3,6],[3,6],[-3,7],[3,7],
 [-6,-1],[-6,1],[-7,-1],[-7,1],
 [-6,-2],[-6,2],[-7,-2],[-7,2],
 [-6,-3],[-6,3],[-7,-3],[-7,3],
 [6,-1],[6,1],[7,-1],[7,1],
 [6,-2],[6,2],[7,-2],[7,2],
 [6,-3],[6,3],[7,-3],[7,3],
 [-1,-6],[1,-6],[-1,-7],[1,-7],
 [-2,-6],[2,-6],[-2,-7],[2,-7],
 [-3,-6],[3,-6],[-3,-7],[3,-7]
];

/**
 Preferred placement of towers, relative to Spawn (x,y)
 */
const towerLocations = [
  [-4,-7],[7,-4],[4,7],[-7,4],
  [4,-7],[7,4],[-4,7],[-7,-4]
];

/**
 * Preferred placement of roads around Spawn location, relative to Spawn (x,y)
 */
const baseRoads = [
  [-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1],
  [0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],[0,-8],
  [2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],
  [0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],
  [-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0],[-8,0],
  [2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],
  [2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],[8,-8],
  [-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],[-8,8],
  [-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],[-8,-8]
];

var maxExtensions = [0, 0, 5, 10, 20, 30, 40, 50, 60]; // Maximum number of extensions based on room level

var maxTowers = [0, 0, 0, 1, 1, 2, 2, 3, 6]; // Maximum number of towers based on room level

/**
 * The most basic type of spawn
 *
 * @type {Object}
 */
var spawnDriver = {

  /**
   * Instructions to be executed every game tick.
   *
   * @param  {Spawn} spawn The active spawn object
   * @return {void}
   */
  run: function(spawn) {
    if (!spawn.memory.cl) 
      spawn.memory.cl = [];

    taskCreeps(spawn);

    var harvestersNeeded = 3; // The minimum number of harvesters. If thenumber of harvesters falls below this threshold, more will be spawned.
    var extensions = spawn.room.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_EXTENSION}); // An array of all extensions in the room
    var towers = spawn.room.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER}); // An array of all towers in the room

    var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.role == "harvester")); // An array of all harvesters assigned to this spawn
    var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.role == "upgrader")); // An array of all upgraders assigned to this spawn
    var builders = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.role == "builder")); // An array of all builders assigned to this spawn

    // Process all towers
    _.each(towers, function(value){ towerDriver.run(value); });

    if (extensions.length >= 4) { // If there are 4 or more extensions
      spawn.memory.scvLevel = 2; // Set level of all SCVs to be created to 2
      if (spawn.room.energyAvailable >= 500) { // If there is at least 500 energy available
        var tier1scvs = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.type == "scv1")); // An array of all tier 1 SCVs assigned to this spawn
        if (tier1scvs.length > 0) { // If there are any tier 1 SCVs assigned to this spawn
          if (spawn.recycleCreep(tier1scvs[0]) == ERR_NOT_IN_RANGE) { // Recycle only the first SCV in the list. If the creep is out of range, tell it to come back to the spawn.
            tier1scvs[0].memory.task = "return";
          }
        }
      }
    } else { // If there are fewer than 4 extensions
      spawn.memory.scvLevel = 1; // Set the level of all SCVs to be created to 1
    }

    if (harvesters.length < harvestersNeeded) { // If there are fewer harvesters than the minimum number of harvesters
      if (spawn.memory.scvLevel == 2) // If the SCV level is 2
        spawnScv2(spawn, "harvester"); // Spawn a level 2 SCV with a role of harvester
      else // If the SCV level is not 2
        spawnScv1(spawn, "harvester"); // Spawn a level 1 SCV with a role of harvester
    } else if (upgraders.length < 1 && spawn.room.controller.my) { // If there is not an upgrader and the room is mine
      if (spawn.memory.scvLevel == 2)
        spawnScv2(spawn, "upgrader"); // Spawn a level 2 SCV with a role of upgrader
      else // If the SCV level is not 2
        spawnScv1(spawn, "upgrader"); // Spawn a level 1 SCV with a role of upgrader
    } else if (builders.length < 1 && spawn.room.controller.my && spawn.room.controller.level > 1) {
      if (spawn.memory.scvLevel == 2)
        spawnScv2(spawn, "builder"); // Spawn a level 2 SCV with a role of builder
      else // If the SCV level is not 2
        spawnScv1(spawn, "builder"); // Spawn a level 1 SCV with a role of builder
    }

    if (spawn.room.controller.my) { // If the room is controlled by me
      if (extensions.length < maxExtensions[spawn.room.controller.level]) // If there are fewer extensions than are allowed by the room level
        manageExtensions(spawn, extensions.length); // Build a new extension
      if (towers.length < maxTowers[spawn.room.controller.level]) // If there are fewer towers than are allowed by the room level
        manageTowers(spawn, towers.length); // Build a new tower
    }
  },

  adoptCreep(spawn, creepName) {
    spawn.memory.cl.push(creepName);
    Memory.creeps[creepName].spawn = spawn.name;
  }
};

/**
 * Spawn a tier 1 SCV
 * @param  {Spawn} spawn   The Spawn object that is creating the new creep
 * @param  {String} newRole The role that the new SCV will fill
 * @return {void}
 */
var spawnScv1 = function(spawn, newRole) {
  var newName = 'SCV' + Game.time; // Create a new unique name for the SCV
  spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: newRole, spawn: spawn.name, type:"scv1"}}); // Spawn the new SCV
  spawn.memory.cl.push(newName); // Add the new creep's name to the creep list
};

/**
 * Spawn a tier 2 SCV
 * @param  {Spawn} spawn   The Spawn object that is creating the new creep
 * @param  {String} newRole The role that the new SCV will fill
 * @return {void}
 */
var spawnScv2 = function(spawn, newRole) {
  var newName = 'SCV' + Game.time; // Create a new unique name for the SCV
  spawn.spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: newRole, spawn: spawn.name, type:"scv2"}}); // Spawn the new SCV
  spawn.memory.cl.push(newName); // Add the new creep's name to the creep list
};

/**
 * Create new extensions based on the number of extensions that exist and the preferred placement
 *
 * @param  {Spawn} spawn             The spawn that is creating the new extension
 * @param  {int} currentExtensions   The number of extensions that exist currently
 * @return {void}
 */
var manageExtensions = function(spawn, currentExtensions) {
  var extensionConstructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES, { filter: (site) => site.structureType == STRUCTURE_EXTENSION}); // An array of construction sites that are designated for extensions

  if (extensionConstructionSites.length == 0) { // If there are no construction sites for extensions. This has the effect of ensuring that only 1 extension construction site is built at a time
    for (var a = currentExtensions; a < extensionLocations.length; a++) { // Look through the preferred extension locations starting from the current number of extensions
      if (spawn.room.createConstructionSite(spawn.pos.x + extensionLocations[a][0], spawn.pos.y + extensionLocations[a][1], STRUCTURE_EXTENSION) == ERR_INVALID_TARGET) { // Attempt to create a new extension construction site in the desired location
        continue; // If the location is invalid (usually because something is already there) then move on to the next preferred location
      } else { // If the construction site creation succeeds, or fails for any other reason
        break; // You're done, no need to search more
      }
    }
  }
};

/**
 * Create new towers based on the number of towers that exist and their preferred placement
 *
 * @param  {Spawn} spawn         The spawn that is creating the new tower
 * @param  {int} currentTowers The number of towers that exist currently
 * @return {void}
 */
var manageTowers = function(spawn, currentTowers) {
  var towerConstructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES, { filter: (site) => site.structureType == STRUCTURE_TOWER}); // An array of construction sites that are designated for towers

  if (towerConstructionSites.length == 0) { // If there are no tower construction sites. This has the effect of ensuring that only 1 tower construction site is built at a time
    for (var a = currentTowers; a < towerLocations.length; a++) { // Look through the preferred tower locations starting from the current number of towers
      if (spawn.room.createConstructionSite(spawn.pos.x + towerLocations[a][0], spawn.pos.y + towerLocations[a][1], STRUCTURE_TOWER) == ERR_INVALID_TARGET) { // Atempt to create a new tower construction site in the desired location
        continue; // If the location is invalid (usually because something is already there) then move on to the next preferred location
      } else { // If the construction site creation succeeds, or fails for any other reason
        break; // You're done, no need to search more
      }
    }
  }
};

/**
 * Assign tasks to all of the creeps assigned to this spawn
 * @param {Spawn} spawn 
 */
function taskCreeps(spawn) {
  for (let a = 0, l = spawn.memory.cl.length; a < l; a++) {
    let creep = Game.creeps[spawn.memory.cl[a]];

    switch(creep.memory.role) { // Execute instructions based on type
      case "builder": roleBuilder.run(creep);
        break;
      case "harvester": roleHarvester.run(creep);
        break;
      case "upgrader": roleUpgrader.run(creep);
        break;
    }
  }
}

function calculateSpawnStage(spawn) {
  let stage = 0;

  /*
  If there are at least 5 creeps at the spawn
  and the spoke roads have not been completed, set stage to 1
  */

}

function isSpokeRoadsFinished(spawn) {
  let a;
  let spawnX = spawn.pos.x;
  let spawnY = spawn.pos.y;
  let room = spawn.room;

  //Check NORTH
  for (a = 1; a < 9; a++) {
    //check for walls
    if (room.lookForAt(LOOK_TERRAIN, spawnX, spawnY - a)) {
      
    }
  }
}

module.exports = spawnDriver;
