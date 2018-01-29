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

function FastOperator(chooser) {
    const terrainLookUp = new Uint8Array(TERRAINS.length);
    let currentTile = 0;
    let adj = {
        reset: (terrains, ct) => {
            terrainLookUp.set(terrains);
            currentTile = ct;
            return adj;
        },
        getTerrains: (terrain) => this.terrainLookUp[terrain]
    };

    this.apply = (board, times = 1) => {
        var w = board.getWidth();
        var h = board.getHeight();
        var len = w * h;
        var boardArr = board.getArray();
        var arSrc = new Int8Array(w * h);
        var arDest = new Int8Array(w * h);

        for (var i = 0; i < len; i++)
            arSrc[i] = boardArr[i];

        var terrains = new Uint8Array(TERRAINS.length);

        for (var t = 0; t < times; t++) {
            for (var y = 1; y < w - 1; y++)
                for (var x = 1; x < w - 1; x++) {
                    var i = y * w + x;
                    terrains.fill(0);
                    terrains[arSrc[i - w - 1]]++;
                    terrains[arSrc[i - w]]++;
                    terrains[arSrc[i - w + 1]]++;
                    terrains[arSrc[i- 1]]++;
                    terrains[arSrc[i]]++;
                    terrains[arSrc[i + 1]]++;
                    terrains[arSrc[i + w - 1]]++;
                    terrains[arSrc[i + w]]++;
                    terrains[arSrc[i + w + 1]]++;
                    var current = arSrc[i];
                    terrains[current]--;
                    arDest[i] = chooser.chooseTile(adj.reset(terrains, current));
                }
                [arSrc, arDest] = [arDest, arSrc];
        }
        for (var i = 0; i < len; i++)
            boardArr[i] = arSrc[i];
    };
    
}
