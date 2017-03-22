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
    this.getBounds = () => bounds;
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y) => this.checkRange(x, y) ? this.get(x, y) : undefined;
    this.iteratePositions = function(callbackXYV, subboardRect = bounds) {        
        var len = subboardRect.width * subboardRect.height;
        var rectW = subboardRect.width;
        var rectX = subboardRect.x;
        var rectY = subboardRect.y;
        for (var i = 0; i < len; i++) {
            var x = rectX + (i % rectW);
            var y = rectY + ((i / rectW) >>> 0);
            callbackXYV(x, y, array[y * w + x]);
        }
    };
    
}

