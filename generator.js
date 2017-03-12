function weightedProb(values, weights) {
    var weightSum = weights.reduce((a, b) => a + b);
    let r = Math.random() * weightSum;
    let idx = 0;
    let weight = weights[0];
    while (weight < r)
        weight += weights[++idx];
    return values[idx];
}

function RandomTerrainGenerator(values, weights) {
    var tileFactory = new TerrainTileFactory();
    this.generate = (board) => {
        board.iteratePositions((x, y) => {
            board.set(x, y, tileFactory.createTile(weightedProb(values, weights)));
        });
    };
}

function Operator(adjacencyMapper, chooser) {
    this.apply = (board, times = 1) => {
        var tempBoard = new Board(board.getWidth(), board.getHeight());
        tempBoard.iteratePositions((x, y) => tempBoard.set(x, y, new TerrainTile(0, new Color(0, 0, 0))));
        var srcBoard = board;
        for (let i = 0; i < times; i++) {
            adjacencyMapper.iterate(srcBoard, (x, y, adj) => {
                chooser.updateTile(adj, tempBoard.get(x, y));
            });
//            srcBoard.iteratePositions((x, y, value) =>
//                tempBoard.set(x, y, chooser.choose(value, adjacencyMapper.get(srcBoard, x, y)))
//            );
            var temp = tempBoard;
            tempBoard = srcBoard;
            srcBoard = temp;
        }
        if (srcBoard !== board)
            board.setAll(srcBoard);
    };
}
