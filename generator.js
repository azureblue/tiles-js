function weightedProb(values, weights) {
    let weightSum = weights.reduce((a, b) => a + b);
    if (weightSum <= 0) 
        throw "illegal state: weights sum <= 0";
    let r = Math.random() * weightSum;
    let idx = 0;
    let weight = weights[0];
    while (weight < r)
        weight = weight + weights[++idx];
    return values[idx];
}

function Operator(adjacencyMapper, chooser, tileInitializer) {
    this.apply = (board, times = 1) => {
        var tempBoard = new Board(board.getWidth(), board.getHeight());
        tempBoard.iteratePositions((x, y) => tempBoard.set(x, y, tileInitializer()));
        var srcBoard = board;
        for (var i = 0; i < times; i++) {
            adjacencyMapper.iterate(srcBoard, (x, y, adj) => {
                chooser.updateTile(adj, tempBoard.get(x, y));
            });
            var temp = tempBoard;
            tempBoard = srcBoard;
            srcBoard = temp;
        }
        if (srcBoard !== board)
            board.setAll(srcBoard);
    };
}
