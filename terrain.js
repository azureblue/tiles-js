const WATER = 0;
const DIRT = 1;
const GRASS = 2;
const FOREST = 3;

const TERRAIN_COLORS = [
    new Color(50, 80, 235),
    new Color(130, 110, 80),
    new Color(30, 170, 20),
    new Color(20, 110, 10)
];
const TERRAIN_COLOR_DELTA = 5;

const TERRAINS = [0, 1, 2, 3];

function TerrainTile(type, color) {
    this.type = type;
    this.color = color;
}

TerrainTile.prototype = {};
TerrainTile.prototype.setToTile = function(tile) {
    this.type = tile.type;
    this.color = tile.color;
};

function TerrainTileFactory(colorDelta = TERRAIN_COLOR_DELTA) {
    var colorRand = new ColorRandomizer(colorDelta);
    this.createTile = (type) => new TerrainTile(type, colorRand.randomize(TERRAIN_COLORS[type]));
    this.resetTile = (tile, type) => {
        tile.type = type;
        tile.color.setToColor(TERRAIN_COLORS[type]);
        colorRand.randomize(tile.color, true);
        return tile;
    };
}

function TerrainRenderer() {
    var nullColor = new Color(50, 50, 50);
    this.render = (ctx, rect, tile) => {
        var color = tile !== undefined ? tile.color : nullColor;
        ctx.fillStyle = color.toFillStyle();
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    };
}

function Terrain8Adjacency(adjArray) {
    this.getTerrains = (terrain) => adjArray[terrain] || 0;
}

function Terrain8LazyAdjacency(board, x, y) {
    var adjArray = [0, 0, 0, 0];
    var fetched = false;
    var x = x;
    var y = y;
    this.currentTile = undefined;
    this.reset = (ct, xx, yy) => {
        x = xx;
        y = yy;
        this.currentTile = ct;
        if (fetched) {
            adjArray.fill(0);
            fetched = false;
        }
    };
    this.getTerrains = (terrain) => {
        if (!fetched) {
            for (let i = -1; i < 2; i++)
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0)
                        continue;
                    if (!board.checkRange(x + i, y + j))
                        continue;
                    let tile = board.get(x + i, y + j);
                    if (tile !== undefined)
                        adjArray[tile.type]++;
                }
            fetched = true;
        }
        return adjArray[terrain] || 0;
    };
}

function Terrain8AdjacencyMapper() {
    this.get = (board, x, y) => {
//        var resAr = [0, 0, 0, 0];
//        for (let i = -1; i < 2; i++)
//            for (let j = -1; j < 2; j++) {
//                if (i === 0 && j === 0)
//                    continue;
//                if (!board.checkRange(x + i, y + j))
//                    continue;
//                let tile = board.get(x + i, y + j);
//                if (tile !== undefined)
//                    resAr[tile.getType()]++;
//            }
        return new Terrain8LazyAdjacency(board, x, y);
    };
}

function Terrain8AdjMapper() {
    this.iterate = (board, adjCallback) => {
        var lazyAdj = new Terrain8LazyAdjacency(board, 0, 0);
        board.iteratePositions((x, y, tile) => {
            lazyAdj.reset(tile, x, y);
            adjCallback(x, y, lazyAdj);            
        });
    };
}

function Terrain8Chooser(waterInitProb, dirtInitProb, grassInitProb, waterMulti, dirtMulti, grassMulti, currentMulti) {
    var terrAr = [0, 1, 2];
    var tileFactory = new TerrainTileFactory();
    this.updateTile = (adj, targetTile) => {
        var currentTile = adj.currentTile;
        var probs = [waterInitProb + adj.getTerrains(WATER) * waterMulti,
            dirtInitProb + adj.getTerrains(DIRT) * dirtMulti,
            grassInitProb + adj.getTerrains(GRASS) * grassMulti];
        probs[currentTile.type] += currentMulti;
        tileFactory.resetTile(targetTile, weightedProb(terrAr, probs));
    };
}

function Terrain8LandGrow(currentMulti) {
    var tileFactory = new TerrainTileFactory();
    var terrAr = [0, 1, 2];
    this.updateTile = (adj, targetTile) => {
        var currentTile = adj.currentTile;
        if (currentTile.type !== WATER)
            return targetTile.setToTile(currentTile);

        var lands = adj.getTerrains(DIRT) + adj.getTerrains(GRASS);
        if (lands === 0)
            return tileFactory.resetTile(targetTile, WATER);

        var probs = [currentMulti, lands + adj.getTerrains(DIRT) * 2, lands + adj.getTerrains(GRASS) * 2];
        probs[currentTile.type] += currentMulti;
        return tileFactory.resetTile(targetTile, weightedProb(terrAr, probs));
    };
}

function Terrain8ForestSeeder() {
    var tileFactory = new TerrainTileFactory();
    var terrAr = [GRASS, FOREST];
    this.updateTile = (adj, targetTile) => {
        var currentTile = adj.currentTile;
        if (currentTile.type !== GRASS)
            return targetTile.setToTile(currentTile);

        var grasses = adj.getTerrains(GRASS);
        if (grasses < 8)
            return targetTile.setToTile(currentTile);
        var probs = [50, 1];
        return tileFactory.resetTile(targetTile, weightedProb(terrAr, probs));
    };
}

function Terrain8ForestGrow() {
    var tileFactory = new TerrainTileFactory();
    var terrAr = [GRASS, FOREST];
    this.updateTile = (adj, targetTile) => {
        var currentTile = adj.currentTile;
        if (currentTile.type !== GRASS)
            return targetTile.setToTile(currentTile);

        var grasses = adj.getTerrains(GRASS);
        var forests = adj.getTerrains(FOREST);
        if (forests === 0)
            return targetTile.setToTile(currentTile);
        if (grasses + forests < 7)
            return targetTile.setToTile(currentTile);
        var probs = [grasses, 2 * forests];
        return tileFactory.resetTile(targetTile, weightedProb(terrAr, probs));
    };
}

function Terrain8Smoother() {
    var tileFactory = new TerrainTileFactory();
    var terrAr = TERRAINS;
    this.updateTile = (adj, targetTile) => {
        var currentTile = adj.currentTile;
        if (currentTile.type === WATER)
            return targetTile.setToTile(currentTile);

        var probs = TERRAINS.map(t => adj.getTerrains(t) * adj.getTerrains(t));

        return tileFactory.resetTile(targetTile, weightedProb(terrAr, probs));
    };
}
