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

function swapBoards(boardA, boardB) {
    var aArr = boardA.getArray();
    var bArr = boardB.getArray();
    for (var i = 0; i < aArr.length; i++) {
        var t = aArr[i];
        aArr[i] = bArr[i];
        bArr[i] = t;
    }
}

function Operator(adjacencyMapper, chooser, tempBoard) {
    this.apply = (board, times = 1) => {
        for (var i = 0; i < times; i++) {
            adjacencyMapper.iterate(board, 
                (x, y, adj) => chooser.updateTile(adj, tempBoard.get(x, y))
            );
            [board, tempBoard] = [tempBoard, board];
        }
        if (times % 2 === 1)
            swapBoards(board, tempBoard);
    };
}
