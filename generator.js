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
                (x, y, adj) => tempBoard.set(x, y, chooser.chooseTile(adj))
            );
            [board, tempBoard] = [tempBoard, board];
        }
        if (times % 2 === 1) {
            board.iteratePositions((x, y, v) => tempBoard.set(x, y, v));
        }
    };
}
