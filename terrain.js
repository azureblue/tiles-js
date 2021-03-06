const DEEP_WATER = 4;
const WATER = 0;
const DIRT = 1;
const GRASS = 2;
const FOREST = 3;

const TERRAIN_COLORS = [
    new Color(50, 80, 235),
    new Color(130, 110, 80),
    new Color(30, 170, 20),
    new Color(20, 110, 10),
    new Color(30, 50, 155)
];
const TERRAIN_COLOR_DELTA = 5;

const TERRAINS = [DEEP_WATER, WATER, DIRT, GRASS, FOREST];
const LANDS = [DIRT, GRASS, FOREST];
const WATERS = [DEEP_WATER, WATER];

function TerrainTile(type, color) {
    this.type = type;
    this.color = color;
}

TerrainTile.prototype = {};
TerrainTile.prototype.setToTile = function(tile) {
    this.type = tile.type;
    this.color.setToColor(tile.color);
};
function isWaterType(te) { return te <= 0; };
function isLandType(te) { return te > 0 && te < 4; };

var tileUtils = new TerrainTileUtils();

function TerrainTileUtils(colorDelta = TERRAIN_COLOR_DELTA) {
    var colorRand = new ColorRandomizer(colorDelta);
    this.createTile = (type) => new TerrainTile(type, colorRand.randomize(TERRAIN_COLORS[type]));
    this.newTile = () => new TerrainTile(0, new Color(0, 0, 0));
    this.resetTile = (tile, type) => {
        tile.type = type;
        tile.color.setToColor(TERRAIN_COLORS[type]);
        colorRand.randomize(tile.color, true);
        return tile;
    };
}

function RandomTerrainGenerator(values, weights) {
    this.generate = (board) => {
        board.iteratePositions((x, y) => {
            board.set(x, y, weightedProb(values, weights));
        });
    };
}

function Terrain8Adjacency(adjArray) {
    this.getTerrains = (terrain) => adjArray[terrain] || 0;
}

function Terrain8LazyAdjacency(board) {
    var adjArray = new Uint32Array(TERRAINS.length);
    var fetched = false;
    var x, y;
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
    this.getTerrains = function(terrain) {
        if (!fetched) {
            for (var j = -1; j < 2; j++)
                for (var i = -1; i < 2; i++) {
                    var tile = board.getTile(x + i, y + j);
                    if (tile !== undefined)
                        adjArray[tile]++;
                }
            adjArray[this.currentTile]--;
            fetched = true;
        }
        return adjArray[terrain];
    };
}

function Terrain8AdjMapper() {
    this.iterate = (board, adjCallback) => {
        var lazyAdj = new Terrain8LazyAdjacency(board);
        board.iteratePositions((x, y, tile) => {
            lazyAdj.reset(tile, x, y);
            adjCallback(x, y, lazyAdj);            
        });
    };
}

function Terrain8Chooser(waterInitProb, dirtInitProb, grassInitProb, waterMulti, dirtMulti, grassMulti, currentMulti) {
    var terrAr = [0, 1, 2];
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        var probs = [waterInitProb + adj.getTerrains(WATER) * waterMulti,
            dirtInitProb + adj.getTerrains(DIRT) * dirtMulti,
            grassInitProb + adj.getTerrains(GRASS) * grassMulti];
        probs[currentTile] += currentMulti;
        return weightedProb(terrAr, probs);
    };
}

function Terrain8LandGrow(currentMulti) {
    var terrAr = [0, 1, 2];
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== WATER)
            return (currentTile);

        var lands = adj.getTerrains(DIRT) + adj.getTerrains(GRASS);
        if (lands === 0)
            return WATER;

        var probs = [currentMulti, lands + adj.getTerrains(DIRT) * 3, 0/*lands + adj.getTerrains(GRASS) * 2*/];
        probs[currentTile] += currentMulti;
        return (weightedProb(terrAr, probs));
    };
}

function Terrain8GrassGrow() {
    var terrAr = [1, 2];
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== DIRT)
            return currentTile;

        var grass = adj.getTerrains(GRASS);
        var water = adj.getTerrains(WATER);

        var probs = [20, water * 5 + grass * 10];
        return (weightedProb(terrAr, probs));
    };
}

function Terrain8GrassSeed() {
    var terrAr = [1, 2];
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== DIRT)
            return (currentTile);

        var grass = adj.getTerrains(GRASS);
        var water = adj.getTerrains(WATER);

        var probs = [100, water * 10 + grass * 5 + 1];
        return (weightedProb(terrAr, probs));
    };
}

function Terrain8ForestSeeder() {
    var terrAr = [GRASS, FOREST];
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== GRASS)
            return (currentTile);

        var grasses = adj.getTerrains(GRASS);
        if (grasses < 8)
            return (currentTile);
        var probs = [80, 1];
        return (weightedProb(terrAr, probs));
    };
}

function Terrain8ForestGrow() {
    var terrAr = [GRASS, FOREST];
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== GRASS)
            return (currentTile);

        var grasses = adj.getTerrains(GRASS);
        var forests = adj.getTerrains(FOREST);
        if (forests === 0)
            return (currentTile);
        if (grasses + forests < 7)
            return (currentTile);
        var probs = [grasses, 2 * forests];
        return (weightedProb(terrAr, probs));
    };
}

function Terrain8Smoother() {
    var probs = [...TERRAINS];
    var adjToProbs = function(adj) {
        var currentType = adj.currentTile;
        probs.fill(0);
        for (var i = 0; i < TERRAINS.length; i++) {
            var t = TERRAINS[i];
            var ts = adj.getTerrains(t) + (t === currentType ? 1 : 0);
            probs[i] = ts * ts * 2;
        }
    };
    this.chooseTile = (adj) => {
        adjToProbs(adj);
        return (weightedProb(TERRAINS, probs));
    };
}

function Terrain8MaxSmoother(smoothProbability = 1) {
    this.chooseTile = (adj) => {
        var currentType = adj.currentTile;
        if (Math.random() < smoothProbability)
            return (adj.currentTile);
        var bestTerrain = currentType;
        var bestNumber = 1;
        for (var i = 0; i < TERRAINS.length; i++) { 
            var ter = TERRAINS[i];
            var num = adj.getTerrains(ter);
            if (ter === currentType)
                num++;
            if (num > bestNumber) {
                bestNumber = num;
                bestTerrain = ter;
            }
        }
        return (bestTerrain);
    };
}

function Terrain8LandSmoother() {
    var probs = [...LANDS];
    var adjToProbs = function(adj) {
        probs.fill(0);
        let currentType = adj.currentTile;
        for (var i = 0; i < LANDS.length; i++) {
            var t = LANDS[i];
            var ts = adj.getTerrains(t) + (t === currentType ? 1 : 0);
            probs[i] = ts * ts * 2;
        }
    };
    this.chooseTile = (adj) => {
        let currentTile = adj.currentTile;
        if (!isLandType(currentTile))
            return (currentTile);
        adjToProbs(adj);
        return (weightedProb(LANDS, probs));
    };
}

