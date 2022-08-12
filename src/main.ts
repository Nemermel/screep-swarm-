import {ErrorMapper} from "utils/ErrorMapper";
import {Role, roleActions} from "./Creep/Role";
import {spawnCreep} from "./Creep/Creep";

declare global {
  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}



// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  const spawns = Game.spawns;
  const creeps = Game.creeps;
  const harvesters = [];
  const builders = [];

  for (let i in creeps) {
    // @ts-ignore
    if (creeps[i].memory.role == Role.basicHarvester || creeps[i].memory.role == Role.harvester) {
      harvesters.push(creeps[i]);
    }
  }

  for (const spawnID in spawns) {
    const spawn = spawns[spawnID];
    if (spawn.store[RESOURCE_ENERGY] > spawn.store.getCapacity(RESOURCE_ENERGY) * 0.75) {
      if (builders.length < 2 && harvesters.length > 0) {
        spawnCreep(Role.builder, Role.builder);
      }
    }
  }

  if (harvesters.length < 3) {
    const status = spawnCreep(Role.harvester, Role.harvester);
    if (status == ERR_NOT_ENOUGH_ENERGY) {
      spawnCreep(Role.basicHarvester, Role.basicHarvester);
    }
  }


  for (let i in harvesters) {
    // @ts-ignore
    roleActions.get(Role.basicHarvester)(harvesters[i]);
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
