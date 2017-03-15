/* global Vec */

function TilePlane(tileSource, tileRenderer, tileSize, canvas, overlayCanvas) {
    var ctx = canvas.getContext("2d");
    var octx = overlayCanvas.getContext("2d");
    var mouse_down_point, mouse_move_point, dragging = false;
    var touches = [];
    var selected = undefined;
    var offset = new Vec(0, 0);

    overlayCanvas.addEventListener("touchstart", handleTouchstart);
    overlayCanvas.addEventListener("touchend", handleTouchend);
    overlayCanvas.addEventListener("touchmove", handleTouchmove);
    overlayCanvas.addEventListener("mousemove", handle_mouse_move);
    overlayCanvas.addEventListener("mousedown", handle_mouse_down);
    overlayCanvas.addEventListener("mouseup", handle_mouse_drag_stop);
    overlayCanvas.addEventListener("mouseout", handle_mouse_drag_stop);
    overlayCanvas.addEventListener("wheel", handle_mouse_wheel);

    this.render = render;
    this.renderTile = renderTile;

    function render() {
        var cw = canvas.clientWidth;
        var ch = canvas.clientHeight;
        var xalign = offset.x % tileSize;
        var yalign = offset.y % tileSize;
        xalign += xalign >= 0 ? 0 : tileSize;
        yalign += yalign >= 0 ? 0 : tileSize;

        var width_in_chunks = Math.floor((xalign + cw + tileSize - 1) / tileSize);
        var height_in_chunks = Math.floor((yalign + ch + tileSize - 1) / tileSize);
        var firstTilePosOnScreen = new Vec(-xalign, -yalign);
        var firstTile = tileFromScreen(firstTilePosOnScreen);
        var tileOffset = new Vec();
        for (tileOffset.x = 0; tileOffset.x < width_in_chunks; tileOffset.x++)
            for (tileOffset.y = 0; tileOffset.y < height_in_chunks; tileOffset.y++)
                renderTile(firstTile.x + tileOffset.x, firstTile.y + tileOffset.y);

        var gridLineWidth = tileSize / 150;
        octx.clearRect(0, 0, cw, ch);
        octx.lineWidth = 1;
        octx.strokeStyle = "rgba(50, 50, 50, " + gridLineWidth + ")";
        for (var i = 0; i < width_in_chunks; i++) {
            octx.beginPath();
            octx.moveTo(i * tileSize + firstTilePosOnScreen.x, firstTilePosOnScreen.y);
            octx.lineTo(i * tileSize + firstTilePosOnScreen.x, ch + tileSize);
            octx.stroke();
        }

        for (var i = 0; i < height_in_chunks; i++) {
            octx.beginPath();
            octx.moveTo(firstTilePosOnScreen.x, i * tileSize + firstTilePosOnScreen.y);
            octx.lineTo(cw + tileSize, i * tileSize + firstTilePosOnScreen.y);
            octx.stroke();
        }
    }

    function renderTile(x, y) {
        var tile = tileSource.getTile(x, y);
        var rect = screenRect(x, y);
        tileRenderer.render(ctx, rect, tile);
    }

    var tileFromScreen = (screenPos) => new Vec(tileXFromScreen(screenPos.x), tileYFromScreen(screenPos.y));
    var screenRect = (x, y) =>
        new Rect(x * tileSize - offset.x, y * tileSize - offset.y, tileSize, tileSize);

    var tileXFromScreen = (screenX) => Math.floor((screenX + offset.x) / tileSize);
    var tileYFromScreen = (screenY) => Math.floor((screenY + offset.y) / tileSize);

    function forEachTouch(touchList, callback) {
        for (var i = 0; i < touchList.length; i++)
            callback(touchList.item(i));
    }
    
    function touchPos(te) {
        return new Vec(te.clientX, te.clientY);
    }

    function handleTouchstart(evt) {
        forEachTouch(evt.changedTouches, te =>
            touches.push({
                lastPos: new Vec(te.clientX, te.clientY),
                event: te
            })
        );
    }

    function handleTouchmove(evt) {
        if (touches.length === 1) {
            var currentPos = new Vec(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
            var dxy = currentPos.vector_to(touches[0].lastPos);
            touches[0].lastPos = currentPos;
            offset.move(dxy);
            render();
        } else if (touches.length === 2) {
            //TODO: add pinch/zoom
//            var startDist = Vec.dist(touches[0].lastPos, touches[1].lastPos);
//            var currentDist = Vec.dist(touchPos(evt.changedTouches[0]), touchPos(evt.changedTouches[1]));
//            var distDiff = currentDist - startDist;
//            distDiff = distDiff * 2 / canvas.clientWidth;
//            if (Math.abs(distDiff) >= 1) {
//                touches[0].lastPos = touchPos(evt.changedTouches[0]);
//                touches[1].lastPos = touchPos(evt.changedTouches[1]);
//                var tileSizeChange = ((distDiff < 0) ? tileSize : -tileSize / 2);
//                zoom(tileSizeChange);
//            }
        }
    }

    function handleTouchend(evt) {
        forEachTouch(evt.changedTouches, te =>
            touches = touches.filter(tc => tc.event.identifier !== te.identifier)
        );
    }

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
        var tileSizeChange = ((event.deltaY < 0) ? tileSize : -tileSize / 2);
        zoom(tileSizeChange);
    }
    
    function zoom(tileSizeChange) {
        let oldTileSize = tileSize;
        tileSize += tileSizeChange;
        if (tileSize < 10)
            tileSize = 10;
        var cw = canvas.clientWidth;
        var ch = canvas.clientHeight;
        let xo = offset.x + cw / 2;
        let yo = offset.y + ch / 2;
        offset.x += Math.round(xo * tileSize / oldTileSize - xo);
        offset.y += Math.round(yo * tileSize / oldTileSize - yo);
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
