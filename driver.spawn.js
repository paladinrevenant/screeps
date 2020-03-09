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
const SCV = require("creep.scv");
const {
  MAX_EXTENSIONS,
  EXTENSION_LOCATIONS,
  MAX_TOWERS,
  TOWER_LOCATIONS,
  SCV_TASK,
  SCV_ROLE,
  SCV_PROTOTYPE
} = require(constants);
var towerDriver = require("driver.tower");
var roleBuilder = require("role.builder");
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");

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

    var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.sp == spawn.name && creep.memory.role == "harvester")); // An array of all harvesters assigned to this spawn
    var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.sp == spawn.name && creep.memory.role == "upgrader")); // An array of all upgraders assigned to this spawn
    var builders = _.filter(Game.creeps, (creep) => (creep.memory.sp == spawn.name && creep.memory.role == "builder")); // An array of all builders assigned to this spawn

    // Process all towers
    _.each(towers, function(value){ towerDriver.run(value); });

    if (extensions.length >= 4) { // If there are 4 or more extensions
      spawn.memory.scvLevel = 2; // Set level of all SCVs to be created to 2
      if (spawn.room.energyAvailable >= 500) { // If there is at least 500 energy available
        var tier1scvs = _.filter(Game.creeps, (creep) => (creep.memory.sp == spawn.name && creep.memory.type == "scv1")); // An array of all tier 1 SCVs assigned to this spawn
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
      if (extensions.length < MAX_EXTENSIONS[spawn.room.controller.level]) // If there are fewer extensions than are allowed by the room level
        manageExtensions(spawn, extensions.length); // Build a new extension
      if (towers.length < MAX_TOWERS[spawn.room.controller.level]) // If there are fewer towers than are allowed by the room level
        manageTowers(spawn, towers.length); // Build a new tower
    }
  },

  adoptCreep(spawn, creepName) {
    spawn.memory.cl.push(creepName);
    Memory.creeps[creepName].spawn = spawn.name;
  },

  periodicChecks(spawn) {
    setSpawnStage(spawn);
    stageFunctions[spawn.memory.st](spawn);
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
    for (var a = currentExtensions; a < EXTENSION_LOCATIONS.length; a++) { // Look through the preferred extension locations starting from the current number of extensions
      if (spawn.room.createConstructionSite(spawn.pos.x + EXTENSION_LOCATIONS[a][0], spawn.pos.y + EXTENSION_LOCATIONS[a][1], STRUCTURE_EXTENSION) == ERR_INVALID_TARGET) { // Attempt to create a new extension construction site in the desired location
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
    for (var a = currentTowers; a < TOWER_LOCATIONS.length; a++) { // Look through the preferred tower locations starting from the current number of towers
      if (spawn.room.createConstructionSite(spawn.pos.x + TOWER_LOCATIONS[a][0], spawn.pos.y + TOWER_LOCATIONS[a][1], STRUCTURE_TOWER) == ERR_INVALID_TARGET) { // Atempt to create a new tower construction site in the desired location
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

    if (!creep) {
      spawn.memory.cl.splice(a, 1);
      l = spawn.memory.cl.length;
    } else {
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
}

function setSpawnStage(spawn) {
  /*
  If there are at least 5 creeps at the spawn
  and the spoke roads have not been completed, set stage to 1
  */
  if (spawn.memory.cl.length >= 5 && !allSpokeRoadsFinished(spawn)) {
    spawn.memory.st = 1;
  }
  /*
  If the spoke roads have been finished,
  but the source roads have not, set the stage to 2
  */
  else if (allSpokeRoadsFinished(spawn)) {
    spawn.memory.st = 2;
  }

  else {
    spawn.memory.st = 0;
  }
}

/**
 * During stage 0, don't do anything except build up new creeps
 */
function execStage0(spawn) {}

/**
 * During stage 1, build the spoke roads
 */
function execStage1(spawn) {
  //Build each spoke road one at a time
  if (!isSpokeRoadFinished(spawn, TOP)) {
    buildSpokeRoad(spawn, TOP);
  } else if (!isSpokeRoadFinished(spawn, TOP_RIGHT)) {
    buildSpokeRoad(spawn, TOP_RIGHT);
  } else if (!isSpokeRoadFinished(spawn, RIGHT)) {
    buildSpokeRoad(spawn, RIGHT);
  } else if (!isSpokeRoadFinished(spawn, BOTTOM_RIGHT)) {
    buildSpokeRoad(spawn, BOTTOM_RIGHT);
  } else if (!isSpokeRoadFinished(spawn, BOTTOM)) {
    buildSpokeRoad(spawn, BOTTOM);
  } else if (!isSpokeRoadFinished(spawn, BOTTOM_LEFT)) {
    buildSpokeRoad(spawn, BOTTOM_LEFT);
  } else if (!isSpokeRoadFinished(spawn, LEFT)) {
    buildSpokeRoad(spawn, LEFT);
  } else if (!isSpokeRoadFinished(spawn, TOP_LEFT)) {
    buildSpokeRoad(spawn, TOP_LEFT);
  }
}

function execStage2(spawn) {}

/**
 * Builds a spoke road in a given direction.
 * 
 * @param {Spawn} spawn The spawn being processed.
 * @param {number} direction One of the defined direction constants.
 * @returns {void}
 */
function buildSpokeRoad(spawn, direction) {
  let spawnX = spawn.pos.x;
  let spawnY = spawn.pos.y;
  let room = spawn.room;

  for (let a = 1; a < 9; a++) {
    let objects;
    let wall = false;
    let road = false;
    let structure;
    let constructionSite;
    let lookX;
    let lookY;

    switch(direction) {
      case TOP:
        lookX = spawnX;
        lookY = spawnY - a;
        break;
      case TOP_RIGHT:
        lookX = spawnX + a;
        lookY = spawnY - a;
        break;
      case RIGHT:
        lookX = spawnX + a;
        lookY = spawnY;
        break;
      case BOTTOM_RIGHT:
        lookX = spawnX + a;
        lookY = spawnY + a;
        break;
      case BOTTOM:
        lookX = spawnX;
        lookY = spawnY + a;
        break;
      case BOTTOM_LEFT:
        lookX = spawnX - a;
        lookY = spawnY + a;
        break;
      case LEFT:
        lookX = spawnX - a;
        lookY = spawnY;
        break;
      case TOP_LEFT:
        lookX = spawnX - a;
        lookY = spawnY - a;
        break;
    }

    objects = room.lookAt(lookX, lookY);
      
    for (let b = 0, l = objects.length; b < l; b++) {
      if (objects[b].type === "terrain" && objects[b].terrain === "wall") {
        wall = true;
        break;
      } else if (objects[b].type === "structure" && objects[b].structure.structureType === STRUCTURE_ROAD) {
        road = true;
        break;
      } else if (objects[b].type === "structure") {
        structure = objects[b].structure;
      } else if (objects[b].type === "constructionSite") {
        constructionSite = objects[b].constructionSite;
      }
    }

    if (wall) { // If a wall is found, the road can not go any further this way
      break;
    } else if (road || (constructionSite && constructionSite.structureType === STRUCTURE_ROAD)) { // If a road or a construction site for a road is found, then go on to the next space
      continue;
    } else if (structure) { // If there is some other structrue there, destroy it
      structure.destroy();
    } else if (constructionSite && !constructionSite.structureType === STRUCTURE_ROAD) { // If there is a construction site for something other than a road, remove it
      constructionSite.remove();
    }

    room.createConstructionSite(lookX, lookY, STRUCTURE_ROAD);
  }
}

/**
 * An array of functions to be executed at each spawn stage.
 * Holding them this way allows the correct function to be called simply by
 * storing the spawn's stage as an integer.
 */
var stageFunctions = [
  execStage0,
  execStage1,
  execStage2
];

/**
 * Checks to see if all of the spoke roads have been built
 * 
 * @param {Spawn} spawn The spawn being checked
 * @returns {boolean}
 */
function allSpokeRoadsFinished(spawn) {
  if (!isSpokeRoadFinished(spawn, TOP))
    return false;
  if (!isSpokeRoadFinished(spawn, TOP_RIGHT))
    return false;
  if (!isSpokeRoadFinished(spawn, RIGHT))
    return false;
  if (!isSpokeRoadFinished(spawn, BOTTOM_RIGHT))
    return false;
  if (!isSpokeRoadFinished(spawn, BOTTOM))
    return false;
  if (!isSpokeRoadFinished(spawn, BOTTOM_LEFT))
    return false;
  if (!isSpokeRoadFinished(spawn, LEFT))
    return false;
  if (!isSpokeRoadFinished(spawn, TOP_LEFT))
    return false;

  return true;
}

/**
 * Checks to see if a spoke road has been completed in a specific direction
 * 
 * @param {Spawn} spawn The spawn that is being checked
 * @param {Number} direction One of the defined direction constants
 * @returns {boolean}
 */
function isSpokeRoadFinished(spawn, direction) {
  let spawnX = spawn.pos.x;
  let spawnY = spawn.pos.y;
  let room = spawn.room;

  for (let a = 1; a < 9; a++) {
    let objects;
    let wall = false;
    let road = false;

    switch(direction) {
      case TOP:
        objects = room.lookAt(spawnX, spawnY - a);
        break;
      case TOP_RIGHT:
        objects = room.lookAt(spawnX + a, spawnY - a);
        break;
      case RIGHT:
        objects = room.lookAt(spawnX + a, spawnY);
        break;
      case BOTTOM_RIGHT:
        objects = room.lookAt(spawnX + a, spawnY + a);
        break;
      case BOTTOM:
        objects = room.lookAt(spawnX, spawnY + a);
        break;
      case BOTTOM_LEFT:
        objects = room.lookAt(spawnX - a, spawnY + a);
        break;
      case LEFT:
        objects = room.lookAt(spawnX - a, spawnY);
        break;
      case TOP_LEFT:
        objects = room.lookAt(spawnX - a, spawnY - a);
        break;
    }

    for (let b = 0, l = objects.length; b < l; b++) {
      if (objects[b].type === "terrain" && objects[b].terrain === "wall") {
        wall = true;
        break;
      } else if (objects[b].type === "structure" && objects[b].structure.structureType === STRUCTURE_ROAD) {
        road = true;
        break;
      }
    }

    if (wall) { // If a wall is found, the road can not go any further this way
      break;
    } else if (!road) { // If no road is found, then the spoke is not finished
      return false;
    }
  }

  return true; // This spoke is finished
}

module.exports = spawnDriver;
