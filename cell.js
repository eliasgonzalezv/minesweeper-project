class Cell {
  constructor({
    xPos,
    yPos,
    value = 0, //The value of a cell can be the number of adjacent mines,
    // F for flagged or M for mine.
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

  getCellElement() {
    return $(`.col.hidden[data-row="${this.xPos}"][data-col="${this.yPos}"]`);
    // return document.querySelector(
    //   `.col[data-row="${this.xPos}"][data-col="${this.yPos}"]`
    // );
  }
}
