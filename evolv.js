const { sampleState, compare, play } = require("./mancala");

const inputSize = sampleState.flat().length;

const nnTools = require("./nn")({ inputSize });
const mkPlayer = (nn, name) => {
  let faults = 0;
  return {
    name,
    think: (input) => nnTools.think(input, nn),
    punish: () => (faults += 1),
    getFaults: () => faults,
  };
};

let currentGeneration;

const gradeGeneration = (population = []) => {
  // can't imagine a more naive implementation. this is probably the first thing to change
  population
    .sort((a, b) => {
      a = mkPlayer(a, "A");
      b = mkPlayer(b, "B");
      const { winner, turns } = compare(a, b);
      // console.log(winner?.name, turns);
      if (winner === a) return 1;
      if (winner === b) return -1;
      return a.getFaults() - b.getFaults();
    })
    .reverse();
};

const pairsFromArray = (arr) => {
  const pairs = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push([arr[i], arr[i + 1]]);
  }
  return pairs;
};

const mutate = (flat) => {
  const mutateIndex = Math.floor(Math.random() * flat.length);
  flat[mutateIndex] = Math.random() * 2 - 1;
  return flat;
};
const crossover = (a, b) => {
  const aFlat = nnTools.flatteNN(a);
  const bFlat = nnTools.flatteNN(b);
  const splitPoint = Math.floor(aFlat.length / 2);
  const child1 = aFlat.slice(0, splitPoint).concat(bFlat.slice(splitPoint));
  const child2 = bFlat.slice(0, splitPoint).concat(aFlat.slice(splitPoint));
  return [nnTools.foldNN(mutate(child1)), nnTools.foldNN(mutate(child2))];
};

const sexyEvent = (population) => {
  const kiddos = pairsFromArray(population).flatMap(([a, b]) =>
    crossover(a, b)
  );
  return population.concat(kiddos);
};

const randomizeOrder = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    const swapIndex = Math.floor(Math.random() * arr.length);
    [arr[i], arr[swapIndex]] = [arr[swapIndex], arr[i]];
  }
  return arr;
};

const evolve = (maxGeneratoins) => {
  currentGeneration = Array(100)
    .fill()
    .map(() => nnTools.randomNN(inputSize));

  for (let i = 0; i < maxGeneratoins; i++) {
    gradeGeneration(currentGeneration);
    const topHalf = currentGeneration.slice(0, currentGeneration.length / 2);
    currentGeneration = sexyEvent(topHalf);
    currentGeneration = randomizeOrder(currentGeneration);
  }

  play(
    mkPlayer(currentGeneration[0], "A"),
    mkPlayer(currentGeneration[1], "B")
  );
};

evolve(100);
