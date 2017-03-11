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

function Terrain8Adjacency(adjArray) {
    this.getTerrains = (terrain) => adjArray[terrain] || 0;
}

function Terrain8AdjacencyMapper() {
    this.get = (board, x, y) => {
        var resAr = [0, 0, 0, 0];
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) 
                    continue;
                if (!board.checkRange(x + i, y + j))
                    continue;
                resAr[board.get(x + i, y + j).getType()]++;
            }
        return new Terrain8Adjacency(resAr);
    };
}

function Terrain8Chooser(waterInitProb, dirtInitProb, grassInitProb, waterMulti, dirtMulti, grassMulti, currentMulti) {
    var terrAr = [0, 1, 2];
    var tileFactory = new TerrainTileFactory();
    this.choose = (currentTile, adj) => {
        var probs = [waterInitProb + adj.getTerrains(WATER) * waterMulti, 
            dirtInitProb + adj.getTerrains(DIRT) * dirtMulti, 
            grassInitProb + adj.getTerrains(GRASS) * grassMulti];
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
        
        var lands = adj.getTerrains(DIRT) + adj.getTerrains(GRASS);
        if (lands === 0)
            return tileFactory.createTile(WATER);
        
        var probs = [currentMulti, lands + adj.getTerrains(DIRT) * 2, lands + adj.getTerrains(GRASS) * 2];
        probs[currentTile.getType()] += currentMulti;
        return tileFactory.createTile(weightedProb(terrAr, probs));
    };
}

function Terrain8ForestSeeder() {
    var tileFactory = new TerrainTileFactory();
    var terrAr = [GRASS, FOREST];
    this.choose = (currentTile, adj) => {
        if (currentTile.getType() !== GRASS)
            return currentTile;
        
        var grasses = adj.getTerrains(GRASS);
        if (grasses < 8)
            return currentTile;
        var probs = [50, 1];
        return tileFactory.createTile(weightedProb(terrAr, probs));
    };
}

function Terrain8ForestGrow() {
    var tileFactory = new TerrainTileFactory();
    var terrAr = [GRASS, FOREST];
    this.choose = (currentTile, adj) => {
        if (currentTile.getType() !== GRASS)
            return currentTile;
        
        var grasses = adj.getTerrains(GRASS);
        var forests = adj.getTerrains(FOREST);
        if (forests === 0)
            return currentTile;
        if (grasses + forests < 7)
            return currentTile;
        var probs = [grasses, 2 * forests];
        return tileFactory.createTile(weightedProb(terrAr, probs));
    };
}

function Terrain8Smoother() {
    var tileFactory = new TerrainTileFactory();
    var terrAr = TERRAINS;
    this.choose = (currentTile, adj) => {
        if (currentTile.getType() === WATER)
            return currentTile;
        
        var probs = TERRAINS.map(t => adj.getTerrains(t) * adj.getTerrains(t));
        
        return tileFactory.createTile(weightedProb(terrAr, probs));
    };
}
