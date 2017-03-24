function AreaBoard(worldBoard, areaSize, gl) {
    var boardMap = new Map();
    var nullTile = new TerrainTile(0, new Color(15, 15, 15));
    var hash = (x, y) => (5279 * x + y) >>> 0;
    
    this.getAreaBoard = function(x, y) {
        var h = hash(x, y);
        if (boardMap.has(h))
            return boardMap.get(h);        
        var bo = new Board(areaSize, areaSize);
        bo.iteratePositions((xx, yy) => bo.set(
            xx, yy, 
            worldBoard.getTile(xx + x * areaSize, yy + y * areaSize) || nullTile
        ));
        var glBo = new Area(bo);
        glBo.init(gl);
        glBo.updateAll();
        console.log("push " + x + " " + y);
        boardMap.set(h, glBo);
        return glBo;
    };
}
