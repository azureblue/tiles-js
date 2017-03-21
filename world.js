/* global Board */

function World(generator, areaSize) {
    var boardMap = new Map();
    var hash = (x, y) => (5279 * x + y) >>> 0;
    
    this.getAreaBoard = function(x, y) {
        var h = hash(x, y);
        if (boardMap.has(h))
            return boardMap.get(h);
        
        var up = boardMap.get(hash(x, y - 1));
        var down = boardMap.get(hash(x, y + 1));
        var left = boardMap.get(hash(x - 1, 0));
        var right = boardMap.get(hash(x + 1, 0));
        
        var bo = new Board(areaSize, areaSize);
        var adjView = new AdjBoard(bo, up, down, left, right);
        
        generator.generate(adjView);
        boardMap.set(h, bo);
        return bo;
    };
}

function AdjBoard(board, up, down, left, right) {
    var w = board.getWidth();
    var h = board.getHeight();
    Board.call(this, w, h);
    
    this.get = board.get;
    this.set = board.set;
    
    this.getTile = (x, y) => {
        if (this.checkRange(x, y))
            return board.get(x, y);
        if (x < 0 && left !== undefined)
            return left.getTile(left.getWidth() + x, y);
        if (x >= w && right !== undefined)
            return right.getTile(x - w, y);
        if (y < 0 && up !== undefined)
            return up.getTile(x, up.getHeight() + y);
        if (y >= h && down !== undefined)
            return down.getTile(x, y - h);
    };
    
    this.iteratePositions = board.iteratePositions;
    this.getArray = board.getArray;
}
