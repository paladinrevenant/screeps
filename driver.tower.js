/**
 * Governs tower behavior
 *
 * @type {Object}
 */
var towerDriver = {
  /**
   * Tower behavior to be executed every game tick
   *
   * @param  {StructureTower} tower The Tower that is being processed
   * @return {void}
   */
  run: function(tower) {
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS); // Find the closest hostile creep
    if(closestHostile) { // If there are any hostile creeps in the room
      tower.attack(closestHostile); // Attack the closest hostile creep
    }

    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax}); // Find the closest damaged structure
    if(closestDamagedStructure) { // If there are any damaged structures in the room
      tower.repair(closestDamagedStructure); // Repair the closest damaged structure
    }
  }
};

module.exports = towerDriver;
