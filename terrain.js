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

function isWaterType(te) { return te <= 0; }
function isLandType(te) { return te > 0 && te < 4; }

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
                    else
                        adjArray[WATER]++;
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

function Terrain8LandGrow(waterWeight = 2, dirtMulti = 3) {
    this.chooseTile = (adj) => {
        if (adj.currentTile !== WATER)
            return (adj.currentTile);
        return weightedRandomBool(waterWeight, adj.getTerrains(DIRT) * dirtMulti) ? DIRT : WATER;
    };
}

function Terrain8Ann(backgroundTerrain, liveTerrain) {
    this.chooseTile = (adj) => {
        switch (adj.currentTile) {
            case (backgroundTerrain):
                return (adj.getTerrains(liveTerrain) > 5 || adj.getTerrains(liveTerrain) === 4) ? 
                    liveTerrain : backgroundTerrain;
            case (liveTerrain):
                return (adj.getTerrains(liveTerrain) > 4 || adj.getTerrains(liveTerrain) === 3) ? 
                    liveTerrain : backgroundTerrain;              
        }        
        return adj.currentTile;     
    };
}

function Terrain8GrassGen(dirtWeight = 100, waterMulti = 10, grassMulti = 5, grassAdd = 1) {
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== DIRT)
            return currentTile;

        var grass = adj.getTerrains(GRASS);
        var water = adj.getTerrains(WATER);

        return weightedRandomBool(dirtWeight, water * waterMulti + grass * grassMulti + grassAdd) ?
            GRASS : DIRT;
    };
}

function Terrain8ForestSeed(prob = 1/80) {
    this.chooseTile = (adj) => {
        var currentTile = adj.currentTile;
        if (currentTile !== GRASS)
            return currentTile;
        var grasses = adj.getTerrains(GRASS);
        if (grasses < 8)
            return currentTile;
        return randomBool(prob) ? FOREST : GRASS;
    };
}

function Terrain8ForestGrow(grassMulti = 1, forsetMulti = 2) {
    var terrAr = [GRASS, FOREST];
    this.chooseTile = (adj) => {
        if (adj.currentTile !== GRASS)
            return adj.currentTile;
        var grasses = adj.getTerrains(GRASS);
        var forests = adj.getTerrains(FOREST);
        if (forests === 0 || grasses + forests < 7)
            return adj.currentTile;
        return weightedRandomBool(grasses * grassMulti, forests * forsetMulti) ?
            FOREST : GRASS;
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

function Terrain8MaxSmoother(terrains, smoothProbability = 1) {
    this.chooseTile = (adj) => {
        var currentType = adj.currentTile;
        if (Math.random() < smoothProbability)
            return (adj.currentTile);
        var bestTerrain = currentType;
        var bestNumber = 1;
        for (var i = 0; i < terrains.length; i++) { 
            var ter = terrains[i];
            var num = adj.getTerrains(ter);
            if (ter === currentType)
                num++;
            if (num > bestNumber) {
                bestNumber = num;
                bestTerrain = ter;
            }
        }
        return bestTerrain;
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

