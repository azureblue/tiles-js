const WATER = 0;
const DIRT = 1;
const GRASS = 2;

const TERRAIN_COLORS = [new Color(50, 80, 235), new Color(130, 110, 80), new Color(30, 170, 20)];

function TerrainRenderer() {
    this.render = (ctx, tile, tileSize) => {
        var color = tile !== undefined ? TERRAIN_COLORS[tile] : new Color(50, 50, 50);
        ctx.fillStyle = color.toFillStyle();
        ctx.fillRect(0, 0, tileSize, tileSize);
    };
}

function Terrain8Adjacency(waters, dirts, grasses) {
    this.waters = waters;
    this.dirts = dirts;
    this.grasses = grasses;
}

function Terrain8AdjacencyMapper() {
    this.get = (board, x, y) => {
        var resAr = [0, 0, 0];
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                if (i === j) 
                    continue;
                if (!board.checkRange(x + i, y + j))
                    continue;
                let tile = board.get(x + i, y + j);
                if (tile === undefined || tile < 0 || tile > 2)
                    throw "invalid tile";
                resAr[tile]++;
            }
        return new Terrain8Adjacency(...resAr);
    };
}

function Terrain8Chooser(waterInitProb, dirtInitProb, grassInitProb, waterMulti, dirtMulti, grassMulti, currentMulti) {
    var terrAr = [0, 1, 2];
    this.choose = (currentTile, adj) => {
        var probs = [waterInitProb + adj.waters * waterMulti, 
            dirtInitProb + adj.dirts * dirtMulti, 
            grassInitProb + adj.grasses * grassMulti];
        probs[currentTile] += currentMulti;
        return weightedProb(terrAr, probs);
    };
}

function Terrain8LandGrow(currentMulti) {
    var terrAr = [0, 1, 2];
    this.choose = (currentTile, adj) => {
        if (currentTile !== WATER)
            return currentTile;
        
        var lands = adj.dirts + adj.grasses;
        if (lands === 0)
            return WATER;
        
        var probs = [currentMulti, lands + adj.dirts * 2, lands + adj.grasses * 2];
        probs[currentTile] += currentMulti;
        return weightedProb(terrAr, probs);
    };
}
