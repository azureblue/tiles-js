function weightedProb(values, weights) {
    var weightSum = 0;
    for (var i = 0; i < weights.length; i++)
        weightSum += weights[i];
    if (weightSum <= 0)
        throw "illegal state: weights sum <= 0";
    var r = Math.random() * weightSum;
    var idx = 0;
    var weight = weights[0];
    while (weight < r)
        weight = weight + weights[++idx];
    return values[idx];
}

function swapBoards(boardA, boardB) {
    var aArr = boardA.getArray();
    var bArr = boardB.getArray();
    for (var i = 0; i < aArr.length; i++) {
        var t = aArr[i];
        aArr[i] = bArr[i];
        bArr[i] = t;
    }
}

function Operator(adjacencyMapper, chooser) {
    this.apply = (board, tempBoard, times = 1) => {        
        for (var i = 0; i < times; i++) {
            adjacencyMapper.iterate(
                board, 
                (x, y, adj) => chooser.updateTile(adj, tempBoard.get(x, y))
            );
            [board, tempBoard] = [tempBoard, board];
        }
        if (times % 2 === 1) {
            board.iteratePositions((x, y, v) => { 
                board.set(x, y, tempBoard.get(x, y));
                tempBoard.set(x, y, v);
            });
        }
    };
}
