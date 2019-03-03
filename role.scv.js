var roleScv = {
  assignTask: function(creep) {
    if (!creep.memory.task)
      creep.memory.task = "harvest";

    if (creep.ticksToLive < 100)
      creep.memory.task = "return";

    if (creep.memory.task != "harvest" && creep.memory.task != "return" && creep.carry.energy == 0) {
      creep.memory.task = "harvest";
      creep.say('🔄 harvest');
    }
  }


};

module.exports = roleScv;
