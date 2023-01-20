// const stateSample = [
//   // board
//   [4, 4, 4, 5, 5, 5], // their
//   [4, 4, 4, 4, 0, 5], // mine
//   [0, 0], // scores their,mine
//   [-1, -1, -1, 5], // prev 4 moves, -1 denotes undefined
//   1,
// ];

const getInitialState = () => [
  [4, 4, 4, 4, 4, 4], // their
  [4, 4, 4, 4, 4, 4], // mine
  [0, 0], // scores their,mine
  [-1, -1, -1, -1], // position on my board side
  0,
];

const NEXT = ([row, col]) => {
  const direction = row ? 1 : -1;
  col += direction;
  if (col > 5) {
    row = 0;
    col = 5;
  }
  if (col < 0) {
    row = 1;
    col = 0;
  }
  return [row, col];
};

//tools
const sumr = (acc, i) => acc + i;

const game = (state, players) => {
  const log = [];
  const rotateBoard = () => {
    const t = state[0];
    state[0] = state[1].reverse();
    state[1] = t.reverse();
    state[2] = state[2].reverse();
    players.reverse();
  };

  const rememberMove = (field) => {
    log.push(move);
    state[3].shift();
    state[3].push(field);
  };
  const checkScores = () => {
    if ([state[0], state[1], state[2]].flat().reduce(sumr) !== 2 * 24) {
      throw Error("Conservation of sumtotal failure");
    }
    if (state[2][1] > 24 || state[0].reduce(sumr) === 0) {
      throw Error("win");
    }
  };

  function distribute(pointer, stash = 0) {
    // console.error({ pointer, stash });

    state[pointer[0]][pointer[1]] += 1;
    stash -= 1;
    if (stash < 1) {
      return pointer;
    }
    return distribute(NEXT(pointer), stash);
  }

  function score(pointer) {
    if (pointer[0] === 1 || pointer[1] > 5) return;
    const grab = state[pointer[0]][pointer[1]];
    if (grab === 3 || grab === 2) {
      // console.log({ grab, pointer });
      state[pointer[0]][pointer[1]] = 0;
      state[2][1] += grab;
      score([0, pointer[1] + 1]);
    }
  }

  const illegalMove = (field) => field < 0 || field > 5 || !state[1][field];

  const move = (field) => {
    rememberMove(field);
    const stash = state[1][field];
    // console.log({ field, stash });
    state[1][field] = 0;
    const end = distribute(NEXT([1, field]), stash);
    score(end);
    checkScores();
  };

  const getCurrentPlayer = () => players[1];

  const turn = () => {
    rotateBoard();
    const field = players[1].think(state);
    if (illegalMove(field)) {
      players[1]?.punish();
    } else {
      move(field);
    }
    state[4] += 1;
  };

  const print = () => {
    console.log(`________________________________________ ${state[4]}
 ${players[0].name}${state[2][0]}\t${state[0].join("\t")}
 ${players[1].name}${state[2][1]}\t${state[1].join("\t")}
  `);
  };

  return {
    getCurrentPlayer,
    whosWinning: () => {
      if (state[2][1] > state[2][0]) return players[1];
      if (state[2][1] < state[2][0]) return players[0];
      return null;
    },
    turn,
    print,
    state,
    log,
  };
};

function play(playerA, playerB) {
  const state = getInitialState();
  const game1 = game(state, [playerA, playerB]);
  try {
    while (true) {
      game1.turn();
      game1.turn();
      game1.print();
    }
  } catch (e) {
    console.log("WIN");
    game1.print();
  }
}
function compare(playerA, playerB) {
  const maxTurns = 1000;
  const state = getInitialState();
  const game1 = game(state, [playerA, playerB]);
  try {
    for (let i = 0; i < maxTurns; i++) {
      game1.turn();
      game1.turn();
      // game1.print();
    }
    return {
      winner: game1.whosWinning(),
      moves: game1.log,
      turns: game1.state[4],
    }
  } catch (e) {
    // get winner and return
    if (e.message === "win") {
      return {
        winner: game1.getCurrentPlayer(),
        moves: game1.log,
        turns: game1.state[4],
      };
    }
    throw e;
  }
}

module.exports = {
  play,
  compare,
  getGame: () => {
    const state = getInitialState();
    return game(state, [playerA("A"), playerB("B")]);
  },
  sampleState: getInitialState(),
};
