function Board(w, h) {
    this.rect = new Rect(0, 0, w, h);
    this.checkRange = (x, y) => this.rect.inside(x, y);
    this.array = new Array(w * h);
    this.get = (x, y) => this.array[y * w + x];
    this.set = (x, y, b) => this.array[y * w + x] = b;
    this.setAll = (board) => {
        for (let i = 0; i < this.array.length; i++)
            this.array[i] = board.array[i];
    };
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y) => this.checkRange(x, y) ? this.get(x, y) : undefined;
    this.iteratePositions = (xyCallback) => {
        for (let i = 0; i < w; i++)
            for (let j = 0; j < h; j++)
                xyCallback(i, j, this.get(i, j));
    };
}

