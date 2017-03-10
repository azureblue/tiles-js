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