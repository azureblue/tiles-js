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
        var left = boardMap.get(hash(x - 1, y));
        var right = boardMap.get(hash(x + 1, y));
        
        var bo = new Board(areaSize, areaSize);
//        bo.iteratePositions((x, y) => bo.set(x, y, new TerrainTile(0, new Color(0, 0, 0))));
        var adjView = new AdjBoard(bo, up, down, left, right);
        generator.generateLand(adjView);
        
        if (up !== undefined)
            makeTransitionDown(up, bo);
                
        if (right !== undefined) 
            makeTransitionLeft(right, bo);
        
        generator.populateLand(adjView);
        
        boardMap.set(h, bo);
        return bo;
    };
}

function makeTransitionDown(boardUp, boardDown) {
    var tempBoard = new Board(100, 100);
                tempBoard.iteratePositions((x, y) => tempBoard.set(x, y, new TerrainTile(0, new Color(0, 0, 0))));
                
    var adjMap = new Terrain8AdjMapper();
                var terraSmoother = new Operator(adjMap, new Terrain8Smoother());
                var terraMaxSmoother = new Operator(adjMap, new Terrain8MaxSmoother(0.5));
    var w = boardUp.getWidth();
    var lastRow = boardUp.getHeight() - 1;
    var lastType = boardUp.get(0, lastRow).type;
    var lastIdx = 0;    
    for (var i = 1; i < w; i++) {
        var type = boardUp.get(i, lastRow).type;
        if (type === lastType && i < w - 1)
            continue;
        
        if (lastType === WATER) {
        var peek = Math.random() * 2;
        var commonLen = i - lastIdx;
        var smoothLen = Math.floor(Math.sqrt(commonLen));
        for (var j = 1; j < smoothLen; j++) {
            var currentWidth = Math.cos(Math.PI / 2 * (j / smoothLen)) * commonLen;
            for (var k = 0; k < currentWidth; k++)
                tileUtils.resetTile(boardDown.getTile(lastIdx + k +  Math.round(peek * (commonLen - currentWidth) / 2), j - 1), lastType);
        }
        }
        lastIdx = i;
        lastType = boardUp.get(i, lastRow).type;
    }    
    var clip = new Rect(0, 50, w, 2);
    terraSmoother.apply(boardDown, tempBoard, 2, clip);
    
}

function makeTransitionLeft(boardRight, boardLeft) {
    var h = boardRight.getHeight();
    var lastRow = boardLeft.getWidth() - 1;
    var lastType = boardRight.get(0, 0).type;
    var lastIdx = 0;
    for (var i = 1; i < h; i++) {
        var type = boardRight.get(0, i).type;
        if (type === lastType && i < h - 1)
            continue;
        
        if (lastType === WATER) {
        var peek = Math.random() * 2;
        var commonLen = i - lastIdx;
        var smoothLen = Math.floor(commonLen / 5) + 1;
        for (var j = 1; j < smoothLen; j++) {
            var currentWidth = Math.cos(Math.PI / 2 * (j / smoothLen)) * commonLen;
            for (var k = 0; k < currentWidth; k++) {
                tileUtils.resetTile(boardLeft.getTile(lastRow - (j - 1), lastIdx + k + Math.round(peek * (commonLen - currentWidth) / 2)), lastType);
            }
        }
    }
        lastIdx = i;
        lastType = boardRight.get(0, i).type;
    }
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
