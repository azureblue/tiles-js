function Board(w, h) {
    var bounds = new Rect(0, 0, w, h);
    var array = new Array(w * h);
    this.checkRange = (x, y) => bounds.inside(x, y);
    this.get = (x, y) => array[y * w + x];
    this.set = (x, y, b) => array[y * w + x] = b;
    this.setAll = (board) => {
        var bo = board.getArray();
        var len = array.length;
        for (var i = 0; i < len; i++)
            array[i] = bo[i];
    };
    this.getArray = () => array;
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y) => this.checkRange(x, y) ? this.get(x, y) : undefined;
    this.iteratePositions = (callbackXYV) => {
        var len = array.length;
        for (var i = 0; i < len; i++)
            callbackXYV(i % w, (i / w) >>> 0, array[i]);
    };
}

