function Board(w, h) {
    this.checkRange = (x, y) => !(x < 0 || x >= w || y < 0 || y >= h);
    this.array = new Uint8Array(w * h);
    this.get = (x, y) => this.array[y * w + x];
    this.set = (x, y, b) => this.array[y * w + x] = b;
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y) => this.checkRange(x, y) ? this.get(x, y) : undefined;
    this.iteratePositions = (xyCallback) => {
        for (let i = 0; i < w; i++)
            for (let j = 0; j < h; j++)
                xyCallback(i, j);
    };
}
