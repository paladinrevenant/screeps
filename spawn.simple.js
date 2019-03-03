var towerDriver = require("driver.tower");

/**
 Preferred placement of extensions, relative to Spawn (x,y)
*/
var extensionLocations = [
 [-1,-3],[1,-3],[-3,-1],[3,-1],
 [-3,1],[3,1],[-1,3],[1,3],
 [-3,-5],[-1,-5],[1,-5],[3,-5],
 [-5,-3],[5,-3],[-5,-1],[5,-1],
 [-5,1],[5,1],[-5,3],[5,3],
 [-3,5],[-1,5],[1,5],[3,5],
 [-3,-7],[-1,-7],[1,-7],[3,-7],
 [-7,-3],[7,-3],[-7,-1],[7,-1],
 [-7,1],[7,1],[-7,3],[7,3],
 [-3,7],[-1,7],[1,7],[3,7],
 [-3,-9],[-1,-9],[1,-9],[3,-9],
 [-9,-3],[9,-3],[-9,-1],[9,-1],
 [-9,1],[9,1],[-9,3],[9,3],
 [-3,9],[1,9],[1,9],[3,9],
 [-5,-7],[5,-7],[-7,-5],[7,-5],
 [-7,5],[7,5],[-5,7],[5,7],
 [-3,-11],[-1,-11],[1,-11],[3,-11],
 [-5,-9],[5,-9],[-7,-7],[7,-7],
 [-9,-5],[9,-5],[-7,-9],[7,-9],
 [-9,-7],[9,-7],
 [-11,-3],[11,-3],[-11,-1],[11,-1],
 [-9,5],[9,5],[-7,7],[7,7],
 [-5,9],[5,9],
 [-9,7],[9,7],[-7,9],[7,9],
 [-3,11],[1,11],[-1,11],[3,11]
];

/**
 Preferred placement of towers, relative to Spawn (x,y)
 */
var towerLocations = [
  [-5,-11],[11,-5],[5,11],[-11,5],
  [5,-11],[11,5],[-5,11],[-11,-5]
];

var maxExtensions = [0, 0, 5, 10, 20, 30, 40, 50, 60];

var maxTowers = [0, 0, 0, 1, 1, 2, 2, 3, 6];

var spawnSimple = {

  /** @param {Spawn} spawn **/
  run: function(spawn) {
    var harvestersNeeded = 3;
    var extensions = spawn.room.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_EXTENSION});
    var towers = spawn.room.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER});

    var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.role == "harvester"));
    var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.role == "upgrader"));
    var builders = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.role == "builder"));
    // console.log("Harvesters: " + harvesters.length + "\nUpgraders: " + upgraders.length + "\nBuilders: " + builders.length);


    // Process all towers
    var towers = spawn.room.find(FIND_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER });
    for (var tower in towers)
      towerDriver.run(tower);

    if (extensions.length >= 4) {
      spawn.memory.scvLevel = 2;
      if (spawn.room.energyAvailable >= 500) {
        var tier1scvs = _.filter(Game.creeps, (creep) => (creep.memory.spawn == spawn.name && creep.memory.type == "scv1"));
        if (tier1scvs.length > 0) {
          if (spawn.recycleCreep(tier1scvs[0]) == ERR_NOT_IN_RANGE) {
            tier1scvs[0].memory.task = "return";
          }
        }
      }
    } else {
      spawn.memory.scvLevel = 1;
    }

    if (harvesters.length < harvestersNeeded) {
      if (spawn.memory.scvLevel == 2)
        spawnScv2(spawn, "harvester");
      else
        spawnScv1(spawn, "harvester");
    } else if (upgraders.length < 1 && spawn.room.controller.my) {
      if (spawn.memory.scvLevel == 2)
        spawnScv2(spawn, "upgrader");
      else
        spawnScv1(spawn, "upgrader");
    } else if (builders.length < 1 && spawn.room.controller.my && spawn.room.controller.level > 1) {
      if (spawn.memory.scvLevel == 2)
        spawnScv2(spawn, "builder");
      else
        spawnScv1(spawn, "builder");
    }

    if (spawn.room.controller.my) {
      if (extensions.length < maxExtensions[spawn.room.controller.level])
        manageExtensions(spawn, extensions.length);
      if (towers.length < maxTowers[spawn.room.controller.level])
        manageTowers(spawn, towers.length);
    }
	}
};

var spawnScv1 = function(spawn, newRole) {
  var newName = 'SCV' + Game.time;
  // console.log('Spawning new harvester: ' + newName);
  spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: newRole, spawn: spawn.name, type:"scv1"}});
};

var spawnScv2 = function(spawn, newRole) {
  var newName = 'SCV' + Game.time;
  // console.log('Spawning new harvester: ' + newName);
  spawn.spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: newRole, spawn: spawn.name, type:"scv2"}});
};

var manageExtensions = function(spawn, currentExtensions) {
  var extensionConstructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES, { filter: (site) => site.structureType == STRUCTURE_EXTENSION});

  if (extensionConstructionSites.length == 0) {
    // console.log("Extensions: " + extensions.length);
    // console.log("Max Extensions: " + maxExtensions[spawn.room.controller.level]);
    // console.log("Construction Sites: " + extensionConstructionSites.length);
    for (var a = currentExtensions; a < extensionLocations.length; a++) {
      // console.log("inside loop");
      if (spawn.room.createConstructionSite(spawn.pos.x + extensionLocations[a][0], spawn.pos.y + extensionLocations[a][1], STRUCTURE_EXTENSION) == ERR_INVALID_TARGET) {
        // console.log("continuing");
        continue;
      } else {
        // console.log("breaking");
        break;
      }
    }
  }
};

var manageTowers = function(spawn, currentTowers) {
  var towerConstructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES, { filter: (site) => site.structureType == STRUCTURE_TOWER});

  if (towerConstructionSites.length == 0) {
    for (var a = currentTowers; a < towerLocations.length; a++) {
      if (spawn.room.createConstructionSite(spawn.pos.x + towerLocations[a][0], spawn.pos.y + towerLocations[a][1], STRUCTURE_TOWER) == ERR_INVALID_TARGET) {
        continue;
      } else {
        break;
      }
    }
  }
};

module.exports = spawnSimple;
