const WATER = 0;
const DIRT = 1;
const GRASS = 2;

const TERRAIN_COLORS = [new Color(50, 80, 235), new Color(130, 110, 80), new Color(30, 170, 20)];
const TERRAIN_COLOR_DELTA = 5;

function TerrainTile(type, color) {    
    this.getType = () => type;
    this.getColor = () => color;
}

function TerrainTileFactory(colorDelta = TERRAIN_COLOR_DELTA) {
    var colorRand = new ColorRandomizer(colorDelta);
    this.createTile = (type) => new TerrainTile(type, colorRand.randomize(TERRAIN_COLORS[type]));
}

function TerrainRenderer() {
    this.render = (ctx, rect, tile, tilePos) => {
        var color = tile !== undefined ? tile.getColor() : new Color(50, 50, 50);
        ctx.fillStyle = color.toFillStyle();
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
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
                if (i === 0 && j === 0) 
                    continue;
                if (!board.checkRange(x + i, y + j))
                    continue;
                let tile = board.get(x + i, y + j);
                if (tile === undefined || tile < 0 || tile > 2)
                    throw "invalid tile";
                resAr[tile.getType()]++;
            }
        return new Terrain8Adjacency(...resAr);
    };
}

function Terrain8Chooser(waterInitProb, dirtInitProb, grassInitProb, waterMulti, dirtMulti, grassMulti, currentMulti) {
    var terrAr = [0, 1, 2];
    var tileFactory = new TerrainTileFactory();
    this.choose = (currentTile, adj) => {
        var probs = [waterInitProb + adj.waters * waterMulti, 
            dirtInitProb + adj.dirts * dirtMulti, 
            grassInitProb + adj.grasses * grassMulti];
        probs[currentTile.getType()] += currentMulti;
        return tileFactory.createTile(weightedProb(terrAr, probs));
    };
}

function Terrain8LandGrow(currentMulti) {
    var tileFactory = new TerrainTileFactory();
    var terrAr = [0, 1, 2];
    this.choose = (currentTile, adj) => {
        if (currentTile.getType() !== WATER)
            return currentTile;
        
        var lands = adj.dirts + adj.grasses;
        if (lands === 0)
            return tileFactory.createTile(WATER);
        
        var probs = [currentMulti, lands + adj.dirts * 2, lands + adj.grasses * 2];
        probs[currentTile.getType()] += currentMulti;
        return tileFactory.createTile(weightedProb(terrAr, probs));
    };
}
