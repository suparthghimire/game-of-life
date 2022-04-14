const start_game = document.querySelector("#start_game");
const pause_game = document.querySelector("#pause_game");
const reset_game = document.querySelector("#reset_game");
const clear_board = document.querySelector("#clear_board");
let animationId = null;
const colorIp = document.querySelector("#color");

let color = "#DC143C";
colorIp.addEventListener("input", () => {
  color = colorIp.value;
  setColor(color);
});

const setColor = (value) => {
  color = value;
};
const getColor = () => {
  return color;
};

const range = document.querySelector("#range_resolution");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const dim = 800;
let resolution = 100;
const cell_dim = dim / resolution;
canvas.height = dim;
canvas.width = dim;
ctx.lineWidth = 0.1;

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

const render_board = (resolution, board) => {
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = i * cell_dim;
      const y = j * cell_dim;

      ctx.strokeRect(x, y, cell_dim, cell_dim);
      if (board[i * resolution + j] === 1) {
        ctx.fillStyle = getColor();
        ctx.fillRect(x, y, cell_dim, cell_dim);
      }
      // ctx.font = "15px Arial";
      // ctx.fillText(`${i}, ${j}`, x + cell_dim / 2 - 15, y + cell_dim / 2 + 7.5);
    }
  }
};

const make_board = (resolution) => {
  const arr = [];
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      arr.push(0);
    }
  }
  return arr;
};

const update_board = (board, index) => {
  const i = Math.floor(index / resolution);
  const j = index % resolution;
  const x = i * cell_dim;
  const y = j * cell_dim;
  if (board[index] == 1) {
    ctx.fillStyle = getColor();
    ctx.fillRect(x, y, cell_dim, cell_dim);
  } else if (board[index] == 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, cell_dim, cell_dim);
  }
  ctx.strokeRect(x, y, cell_dim, cell_dim);
  // ctx.font = "15px Arial";
  // ctx.fillStyle = "black";
  // ctx.fillText(`${i}, ${j}`, x + cell_dim / 2 - 15, y + cell_dim / 2 + 7.5);
};

const check_all_fill = (board) => {
  const len = board.filter((cell) => cell === null).length;
  return len === 0;
};

const check_null = (obj) => {
  return Object.keys(obj).some((key) => obj[key] === null);
};
const remove_null = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

const get_nbr_index = (cellidx) => {
  const i = Math.floor(cellidx / resolution);
  const j = cellidx % resolution;
  const inc_i = i + 1;
  const dec_i = i - 1;
  const inc_j = j + 1;
  const dec_j = j - 1;

  let top = { i: null, j: null };
  let bottom = { i: null, j: null };
  let left = { i: null, j };
  let right = { i: null, j };

  let topLeft = { i: null, j: null };
  let topRight = { i: null, j: null };
  let bottomLeft = { i: null, j: null };
  let bottomRight = { i: null, j: null };

  const left_condition = dec_i >= 0;
  const right_condition = inc_i < resolution;
  const top_condition = dec_j >= 0;
  const bottom_condition = inc_j < resolution;

  if (bottom_condition) bottom = { i, j: inc_j };

  if (top_condition) top = { i, j: dec_j };

  if (right_condition) right = { i: inc_i, j };

  if (left_condition) left = { i: dec_i, j };

  if (left_condition && top_condition) topLeft = { i: dec_i, j: dec_j };

  if (right_condition && top_condition) topRight = { i: inc_i, j: dec_j };

  if (left_condition && bottom_condition) bottomLeft = { i: dec_i, j: inc_j };

  if (right_condition && bottom_condition) bottomRight = { i: inc_i, j: inc_j };

  return remove_null({
    top: check_null(top) ? null : top,
    left: check_null(left) ? null : left,
    right: check_null(right) ? null : right,
    bottom: check_null(bottom) ? null : bottom,
    topLeft: check_null(topLeft) ? null : topLeft,
    topRight: check_null(topRight) ? null : topRight,
    bottomLeft: check_null(bottomLeft) ? null : bottomLeft,
    bottomRight: check_null(bottomRight) ? null : bottomRight,
  });
};

const play_game = (resolution, board) => {
  let newBoard = make_board(resolution);
  for (let col = 0; col < resolution; col++) {
    for (let row = 0; row < resolution; row++) {
      const idx = col * resolution + row;
      let neighbours = get_nbr_index(idx);
      let total_alive_nbrs = 0;
      Object.entries(neighbours).forEach(([dir, val]) => {
        const nbr_1d_idx = val.i * resolution + val.j;
        if (board[nbr_1d_idx] === 1) {
          total_alive_nbrs++;
        }
      });
      if (board[idx] === 0 && total_alive_nbrs === 3) newBoard[idx] = 1;
      else if (
        board[idx] === 1 &&
        (total_alive_nbrs < 2 || total_alive_nbrs > 3)
      )
        newBoard[idx] = 0;
      else newBoard[idx] = board[idx];
      update_board(newBoard, idx);
    }
  }
  board = newBoard;
  pause_game.addEventListener("click", () => {
    // clearInterval(interval);
    window.cancelAnimationFrame(animationId);
    start_game.disabled = false;
    pause_game.disabled = true;
  });
  animationId = window.requestAnimationFrame(() =>
    play_game(resolution, board)
  );
};

function main() {
  let board = make_board(resolution);
  board = set_board(board);
  render_board(resolution, board);
  canvas.addEventListener("click", (e) => {
    const ex = e.clientX - canvas.getBoundingClientRect().x;
    const ey = e.clientY - canvas.getBoundingClientRect().y;
    let i = Math.floor(ex / cell_dim);
    let j = Math.floor(ey / cell_dim);
    const idx = i * resolution + j;
    console.log(idx);
    if (board[idx] == 1) {
      board[idx] = 0;
    } else {
      board[idx] = 1;
    }
    update_board(board, idx);
  });
  clear_board.addEventListener("click", () => {
    let idx = 0;
    board.forEach((item) => {
      board[idx] = 0;
      update_board(board, idx);
      idx++;
    });
  });

  start_game.addEventListener("click", () => {
    animationId = window.requestAnimationFrame(() =>
      play_game(resolution, board)
    );
    start_game.disabled = true;
    pause_game.disabled = false;
  });
}
main();

function set_board(board) {
  const data = [
    306, 406, 407, 307, 1305, 1306, 1307, 21504, 1404, 1408, 1503, 1509, 1603,
    1609, 1706, 1804, 1905, 1906, 1907, 1808, 2006, 2305, 2405, 2304, 2404,
    2303, 2403, 2506, 2502, 2701, 2702, 2706, 2707, 22806, 3703, 3803, 3804,
    3704, 6003, 6103, 6104, 6004, 7102, 7101, 7107, 7106, 27305, 7306, 7405,
    7505, 7504, 7404, 7403, 7503, 7302, 7806, 7905, 7906, 7907, 8004, 8008,
    8106, 8203, 8303, 8404, 8505, 8506, 8507, 8408, 8309, 8209, 9406, 9506,
    9507, 9407,
  ];

  data.forEach((item) => {
    board[item] = 1;
  });
  return board;
}
