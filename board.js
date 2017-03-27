function Board(w, h) {
    var bounds = new Rect(0, 0, w, h);
    var array = new Int32Array(w * h);
    this.checkRange = (x, y) => bounds.inside(x, y);
    this.get = (x, y) => array[y * w + x];
    this.set = (x, y, b) => array[y * w + x] = b;
    this.getArray = () => array;
    this.getBounds = () => bounds;
    this.getWidth = () => w;
    this.getHeight = () => h;
    this.getTile = (x, y) => this.checkRange(x, y) ? this.get(x, y) : undefined;
    this.iteratePositions = function(callbackXYV) {        
        var len = w * h;
        for (var i = 0; i < len; i++) {
            var x = i % w;
            var y = (i / w) | 0;
            callbackXYV(x, y, array[y * w + x]);
        }
    };    
}
