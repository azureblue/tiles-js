function Board(w, h) {
    var array = new Int8Array(w * h);
    this.checkRange = (x, y) =>  (x >= 0 && x < w && y >= 0 && y < h);
    this.get = (x, y) => array[y * w + x];
    this.set = (x, y, b) => array[y * w + x] = b;
    this.getArray = () => array;
    this.getBounds = () => bounds;
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y, or = -1) => this.checkRange(x, y) ? this.get(x, y) : or;
    this.iteratePositions = function(callbackXYV) {        
        var len = w * h;
        for (var i = 0; i < len; i++) {
            var x = i % w;
            var y = (i / w) | 0;
            callbackXYV(x, y, array[y * w + x]);
        }
    };
    this.print = () => {
        for (var j = 0; j < h; j++) {
            line = "";
            for (var i = 0; i < w; i++)
                line = line + this.get(i, j) + " ";
            console.log(j + ": " + line);
        }
    }
}

Board.createFrom = function(board) {
    let res = new Board(board.getWidth(), board.getHeight());
    res.getArray().set(board.getArray());
    return res;
};
