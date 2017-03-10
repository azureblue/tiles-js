/* global Vec */

function TilePlane(tileSource, tileRenderer, tileSize, can) {
    var canvas = can ? can : document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var mouse_down_point, mouse_move_point, dragging = false;
    var selected = undefined;
    var offset = new Vec(0, 0);

    canvas.addEventListener("mousemove", handle_mouse_move);
    canvas.addEventListener("mousedown", handle_mouse_down);
    canvas.addEventListener("mouseup", handle_mouse_drag_stop);
    canvas.addEventListener("mouseout", handle_mouse_drag_stop);
    canvas.addEventListener("mousewheel", handle_mouse_wheel);

    this.render = render;

    function render() {
        var cw = canvas.clientWidth;
        var ch = canvas.clientHeight;
        var xalign = offset.x % tileSize;
        var yalign = offset.y % tileSize;
        xalign += xalign >= 0 ? 0 : tileSize;
        yalign += yalign >= 0 ? 0 : tileSize;

        var width_in_chunks = Math.floor((xalign + cw + tileSize - 1) / tileSize);
        var height_in_chunks = Math.floor((yalign + ch + tileSize - 1) / tileSize);
        var firstTile = tileFromScreen(new Vec(-xalign, -yalign));
        var tileOffset = new Vec();
        for (tileOffset.x = 0; tileOffset.x < width_in_chunks; tileOffset.x++)
            for (tileOffset.y = 0; tileOffset.y < height_in_chunks; tileOffset.y++)
                renderTile(firstTile.copy().move(tileOffset));
            
    }
    
    function renderTile(tilePos) {
        var screenPos = screenFromTile(tilePos);
        let tile = tileSource.getTile(tilePos.x, tilePos.y);
        ctx.translate(screenPos.x, screenPos.y);
        if (selected && selected.same_position(tilePos))
            tile = Math.min(tile + 100, 255);
        tileRenderer.render(ctx, tile, tileSize);
        ctx.translate(-screenPos.x, -screenPos.y);
    }
    
    var tileFromScreen = (screenPos) => new Vec(tileXFromScreen(screenPos.x), tileYFromScreen(screenPos.y));
    var screenFromTile = (tilePos) => new Vec(tilePos.x * tileSize - offset.x, tilePos.y * tileSize - offset.y);
    var tileXFromScreen = (screenX) => Math.floor((screenX + offset.x) / tileSize);
    var tileYFromScreen = (screenY) => Math.floor((screenY + offset.y) / tileSize);

    function handle_mouse_down(event) {
        if (event.button === 2) {
            event.preventDefault();
            return;
        }

        mouse_down_point = Vec.from_event(event);
        mouse_move_point = Vec.from_event(event);

        dragging = true;
    }

    function handle_mouse_drag_stop(event) {
        if (!dragging)
            return;
        if (mouse_down_point.same_position(Vec.from_event(event))) {
            selected = tileFromScreen(mouse_down_point);
            render();
        }
        dragging = false;
    }

    function handle_mouse_move(event) {
        if (!dragging)
            return;

        var temp_mouse_move_point = Vec.from_event(event);
        var dxy = temp_mouse_move_point.vector_to(mouse_move_point);

        offset.move(dxy);

        mouse_move_point = temp_mouse_move_point;
        render();
    }
    
    function handle_mouse_wheel(event) {
        tileSize += (((event.wheelDelta ? event.wheelDelta : -event.detail) > 0) ? 10 : -10);
        if (tileSize < 10)
            tileSize = 10;
        render();
    }

    this.getCanvas = () => canvas;
}

function SimpleTileRenderer() {
    this.render = (ctx, tile, tileSize) => {
        tile = tile ? tile : 100;
        ctx.fillStyle = new Color(tile, tile, tile).toFillStyle();
        ctx.fillRect(0, 0, tileSize, tileSize);
    };
}
