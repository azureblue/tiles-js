function AreaBoard(worldBoard, areaSize, gl) {
    var boardMap = new Map();
    var nullTile = -1;
    var hash = (x, y) => (5279 * x + y) >>> 0;
    
    this.getAreaBoard = function(x, y) {
        var h = hash(x, y);
        if (boardMap.has(h))
            return boardMap.get(h);        
        var bo = new Board(areaSize, areaSize);
        bo.iteratePositions((xx, yy) => {
            var tile = worldBoard.getTile(xx + x * areaSize, yy + y * areaSize);
            bo.set(xx, yy, tile === undefined ? nullTile : tile);
        });
        var glBo = new Area(bo);
        glBo.init(gl);
        glBo.updateAll();
        console.log("push " + x + " " + y);
        boardMap.set(h, glBo);
        return glBo;
    };
}
