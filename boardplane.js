/* global Vec */

function TilePlane(tileSource, tileSize, canvas, overlayCanvas) {
    //var ctx = canvas.getContext("2d");
    var octx = overlayCanvas.getContext("2d");
    var mouse_down_point, mouse_move_point, dragging = false;
    var touches = [];
    var selected;
    var offset = new Vec(0, 0);
    var cw, ch;
    var widthInChunks, heightInChunks;
    var gl;
    var gridVertices;
    var gridColors;
    var gridElements;
    var nullColor = new Color(50, 50, 50);

    overlayCanvas.addEventListener("touchstart", handleTouchstart);
    overlayCanvas.addEventListener("touchend", handleTouchend);
    overlayCanvas.addEventListener("touchmove", handleTouchmove);
    overlayCanvas.addEventListener("mousemove", handle_mouse_move);
    overlayCanvas.addEventListener("mousedown", handle_mouse_down);
    overlayCanvas.addEventListener("mouseup", handle_mouse_drag_stop);
    overlayCanvas.addEventListener("mouseout", handle_mouse_drag_stop);
    overlayCanvas.addEventListener("wheel", handle_mouse_wheel);

    this.render = render;
    this.updateSize = updateSize;
    init();
    updateSize();
    
    function updateSize() {
        cw = canvas.clientWidth;
        ch = canvas.clientHeight;

        widthInChunks = Math.floor((cw + tileSize - 1) / tileSize) + 1;
        heightInChunks = Math.floor((ch + tileSize - 1) / tileSize) + 1;

        gridVertices = new Float32Array(widthInChunks * heightInChunks * 8);
        gridColors = new Float32Array(widthInChunks * heightInChunks * 12);
        gridElements = new Uint16Array(widthInChunks * heightInChunks * 6);

        var vertex = 0;
        var element = 0;
        var vertexElement = 0;
        for (var x = 0; x < widthInChunks; x++)
            for (var y = 0; y < heightInChunks; y++) {
                gridElements[element++] = vertexElement;
                gridElements[element++] = vertexElement + 1;
                gridElements[element++] = vertexElement + 2;

                gridElements[element++] = vertexElement + 1;
                gridElements[element++] = vertexElement + 2;
                gridElements[element++] = vertexElement + 3;
                vertexElement += 4;

                gridVertices[vertex++] = -1 + (x * tileSize) / cw * 2;
                gridVertices[vertex++] = 1 - (y * tileSize) / ch * 2;

                gridVertices[vertex++] = -1 + (x * tileSize + tileSize) / cw * 2;
                gridVertices[vertex++] = 1 - (y * tileSize) / ch * 2;

                gridVertices[vertex++] = -1 + (x * tileSize) / cw * 2;
                gridVertices[vertex++] = 1 - (y * tileSize + tileSize) / ch * 2;

                gridVertices[vertex++] = -1 + (x * tileSize + tileSize) / cw * 2;
                gridVertices[vertex++] = 1 - (y * tileSize + tileSize) / ch * 2;
            }
        gl.updateArraysAndElements(gridVertices, gridElements);

    }

    function render() {
        cw = canvas.clientWidth;
        ch = canvas.clientHeight;
        var xalign = offset.x % tileSize;
        var yalign = offset.y % tileSize;
        xalign += xalign >= 0 ? 0 : tileSize;
        yalign += yalign >= 0 ? 0 : tileSize;

        var firstTilePosOnScreen = new Vec(-xalign, -yalign);
        gl.viewport(0, 0, cw, ch);
        gl.translate(-xalign / cw * 2, yalign / ch * 2);

        var firstTile = tileFromScreen(firstTilePosOnScreen);
        var tileOffset = new Vec();
        var vertexColor = 0;
        for (tileOffset.x = 0; tileOffset.x < widthInChunks; tileOffset.x++)
            for (tileOffset.y = 0; tileOffset.y < heightInChunks; tileOffset.y++) {
                
                var tile = tileSource.getTile(firstTile.x + tileOffset.x, firstTile.y + tileOffset.y);
                var col = tile ? tile.color : nullColor;
                
                var r = col.r / 255;
                var g = col.g / 255;
                var b = col.b / 255;
                gridColors[vertexColor++] = r;
                gridColors[vertexColor++] = g;
                gridColors[vertexColor++] = b;

                gridColors[vertexColor++] = r;
                gridColors[vertexColor++] = g;
                gridColors[vertexColor++] = b;

                gridColors[vertexColor++] = r;
                gridColors[vertexColor++] = g;
                gridColors[vertexColor++] = b;

                gridColors[vertexColor++] = r;
                gridColors[vertexColor++] = g;
                gridColors[vertexColor++] = b;
            }

        gl.updateColors(gridColors);
        gl.draw(gridElements.length);

        var gridLineWidth = tileSize / 150;
        octx.clearRect(0, 0, cw, ch);
        octx.lineWidth = 1;
        octx.strokeStyle = "rgba(50, 50, 50, " + gridLineWidth + ")";
        for (var i = 0; i < widthInChunks; i++) {
            octx.beginPath();
            octx.moveTo(i * tileSize + firstTilePosOnScreen.x, firstTilePosOnScreen.y);
            octx.lineTo(i * tileSize + firstTilePosOnScreen.x, ch + tileSize);
            octx.stroke();
        }

        for (var i = 0; i < heightInChunks; i++) {
            octx.beginPath();
            octx.moveTo(firstTilePosOnScreen.x, i * tileSize + firstTilePosOnScreen.y);
            octx.lineTo(cw + tileSize, i * tileSize + firstTilePosOnScreen.y);
            octx.stroke();
        }
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
        updateSize();
        render();
    }

    this.getCanvas = () => canvas;

    function init() {
        gl = canvas.getContext("webgl");

        gl.translate = function (x, y) {
            gl.uniform4f(translation, x, y, 0, 0);
        };

        gl.updateArraysAndElements = function (vertexArray, elementArray) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexArray);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, elementArray);
        };

        gl.updateColors = function (colorArray) {
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, colorArray);
        };

        gl.draw = function (len) {
            gl.clearColor(0.0, 0.0, 0.0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
        };

        var vertexShaderSrc =
                "attribute vec3 pos;" +
                "attribute vec3 color;" +
                "uniform vec4 translation;" +
                "varying vec3 col;" +
                "void main(void) {" +
                "   gl_Position = vec4(pos, 1) + translation;" +
                "   col = color;" +
                "}";


        var fragmentShaderSrc =
                "precision mediump float;" +
                "varying vec3 col;" +
                "void main(void) {" +
                "   gl_FragColor = vec4(col, 1.);" +
                "}";

        var vertexBuffer = gl.createBuffer();
        var colorBuffer = gl.createBuffer();
        var elements = gl.createBuffer();

        const MAX_QUADS = 1000 * 1000;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, MAX_QUADS * 4 * 2, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, MAX_QUADS * 4 * 3, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, MAX_QUADS * 6, gl.STATIC_DRAW);

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSrc);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSrc);
        gl.compileShader(fragmentShader);

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        var translation = gl.getUniformLocation(program, "translation");

        var posAttr = gl.getAttribLocation(program, "pos");
        var colorAttr = gl.getAttribLocation(program, "color");

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posAttr);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorAttr);

        gl.clearColor(0.0, 0.0, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}


function SimpleTileRenderer() {
    this.render = (ctx, tile, tileSize) => {
        tile = tile ? tile : 100;
        ctx.fillStyle = new Color(tile, tile, tile).toFillStyle();
        ctx.fillRect(0, 0, tileSize, tileSize);
    };
}
