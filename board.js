function Board(w, h) {
    var bounds = new Rect(0, 0, w, h);
    var array = new Array(w * h);
    this.checkRange = (x, y) => bounds.inside(x, y);
    this.get = (x, y) => array[y * w + x];
    this.set = (x, y, b) => array[y * w + x] = b;
    this.setAll = (board) => {
        var ba = board.getArray();
        for (var i = 0; i < array.length; i++)
            array[i] = ba[i];
    };
    this.getArray = () => array;
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y) => this.checkRange(x, y) ? this.get(x, y) : undefined;
    this.iteratePositions = (xyCallback) => {
        for (var i = 0; i < w; i++)
            for (var j = 0; j < h; j++)
                xyCallback(i, j, this.get(i, j));
    };
}

