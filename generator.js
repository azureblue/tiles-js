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
        for (let i = 0; i < times; i++) {
            board.iteratePositions((x, y) => {
                tempBoard.set(x, y, chooser.choose(board.get(x, y), adjacencyMapper.get(board, x, y)));
            });
            board.array = tempBoard.array.slice();
    }
    };
}
