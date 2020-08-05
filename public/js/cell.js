class Cell {
  constructor({
    xPos,
    yPos,
    value = 0, //The value of a cell can be the number of adjacent mines,
    // M for mine.
    isRevealed = false,
    isMine = false,
    isFlagged = false,
  }) {
    Object.assign(this, {
      xPos,
      yPos,
      value,
      isMine,
      isRevealed,
      isFlagged,
    });
  }

//return html element that represent the specific cell at that x and y position
  getCellElement() {
    return $(`.col.hidden[data-row="${this.xPos}"][data-col="${this.yPos}"]`);
  }
}
