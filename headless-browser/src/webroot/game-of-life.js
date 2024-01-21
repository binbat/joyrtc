/**
 * Play Conway's Game of Life in a <canvas>
 * @param {HTMLCanvasElement} cvs
 */
export function playGameOfLife(cvs) {
  const width = cvs.width;
  const height = cvs.height;
  const ctx = cvs.getContext('2d');
  const cntW = Math.ceil(width / 20);
  const cntH = Math.ceil(height / 20);
  const cellSize = width / cntW;
  function allocCells() {
    return new Array(cntH).fill(0).map(() => new Array(cntW));
  }
  /**
   * @param {(i: number, j: number) => void} fn
   */
  function mapCells(fn) {
    for (let i = 0; i < cntH; i++) {
      for (let j = 0; j < cntW; j++) {
        fn(i, j);
      }
    }
  }
  function getCell(cells, i, j) {
    if (i < 0 || i >= cntH) i = (i + cntH) % cntH;
    if (j < 0 || j >= cntW) j = (j + cntW) % cntW;
    return cells[i][j];
  }
  function isAlive(cells, i, j) {
    let liveCnt = -cells[i][j];
    for (let offsetH = -1; offsetH <= 1; offsetH++) {
      for (let offsetW = -1; offsetW <= 1; offsetW++) {
        if (getCell(cells, i + offsetH, j + offsetW) === 1) {
          liveCnt++;
        }
      }
    }
    if (cells[i][j] === 1) { // cell is alive
      if (liveCnt < 2 || liveCnt > 3) return 0;
      return 1;
    } else { // cell is dead
      if (liveCnt === 3) return 1;
      return 0;
    }
  }
  function spawnCells(cells) {
    const newCells = allocCells();
    mapCells((i, j) => newCells[i][j] = isAlive(cells, i, j));
    return newCells;
  }
  function clearCvs() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  }
  function drawCells(cells) {
    ctx.fillStyle = 'black';
    mapCells((i, j) => {
      if (cells[i][j] === 1) {
        ctx.fillRect((j * cellSize) - 1, (i * cellSize) - 1, cellSize - 2, cellSize - 2);
      }
    });
  }
  let cells = allocCells();
  mapCells((i, j) => cells[i][j] = Math.random() > 0.8 ? 1 : 0);
  clearCvs();
  drawCells(cells);
  let lastDrawTime = performance.now();
  function doFrame() {
    requestAnimationFrame((time) => {
      if (time - lastDrawTime >= 200) {
        cells = spawnCells(cells);
        clearCvs();
        drawCells(cells);
        lastDrawTime = performance.now();
      }
      doFrame();
    })
  }
  doFrame();
}
