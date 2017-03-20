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
    var urArea, brArea, ulArea, blArea;
    var posAttr;
    var colorAttr;
    var gl;

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
    
    function updateSize() {
        cw = canvas.clientWidth;
        ch = canvas.clientHeight;
        urArea.updateAll();
        brArea.updateAll();
        ulArea.updateAll();
        blArea.updateAll();

        widthInChunks = Math.floor((cw + tileSize - 1) / tileSize) + 1;
        heightInChunks = Math.floor((ch + tileSize - 1) / tileSize) + 1;

        gl.scale(1 / cw * tileSize, 1 / ch * tileSize);
    }

    function render() {
        cw = canvas.clientWidth;
        ch = canvas.clientHeight;
        var xalign = offset.x % tileSize;
        var yalign = offset.y % tileSize;
        xalign += xalign >= 0 ? 0 : tileSize;
        yalign += yalign >= 0 ? 0 : tileSize;
        
        gl.clearColor(0.0, 0.0, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, cw, ch);
        gl.translate(-offset.x * 2 / cw, offset.y * 2  / ch);        
        urArea.draw(posAttr, colorAttr);
        gl.translate(-offset.x * 2 / cw, offset.y * 2 / ch - tileSize * 100 / ch);
        brArea.draw(posAttr, colorAttr);
        gl.translate(-offset.x * 2 / cw - tileSize * 100 / cw, offset.y * 2  / ch);
        ulArea.draw(posAttr, colorAttr);
        gl.translate(-offset.x * 2 / cw - tileSize * 100 / cw, offset.y * 2 / ch - tileSize * 100 / ch);
        blArea.draw(posAttr, colorAttr);
        
//        var gridLineWidth = tileSize / 150;
//        octx.clearRect(0, 0, cw, ch);
//        octx.lineWidth = 1;
//        octx.strokeStyle = "rgba(50, 50, 50, " + gridLineWidth + ")";
//        for (var i = 0; i < widthInChunks; i++) {
//            octx.beginPath();
//            octx.moveTo(i * tileSize + firstTilePosOnScreen.x, firstTilePosOnScreen.y);
//            octx.lineTo(i * tileSize + firstTilePosOnScreen.x, ch + tileSize);
//            octx.stroke();
//        }

//        for (var i = 0; i < heightInChunks; i++) {
//            octx.beginPath();
//            octx.moveTo(firstTilePosOnScreen.x, i * tileSize + firstTilePosOnScreen.y);
//            octx.lineTo(cw + tileSize, i * tileSize + firstTilePosOnScreen.y);
//            octx.stroke();
//        }
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
        urArea = new Area(tileSource);
        urArea.init(gl);
        brArea = new Area(tileSource);
        brArea.init(gl);
        ulArea = new Area(tileSource);
        ulArea.init(gl);
        blArea = new Area(tileSource);
        blArea.init(gl);

        

        gl.translate = function (x, y) {
            gl.uniform4f(translation, x, y, 0, 0);
        };
        
        gl.scale = function (scx, scy) {
            gl.uniformMatrix4fv(scale, false, new Float32Array([
                scx, 0, 0, 0,
                0, scy, 0, 0,
                0,   0, 1, 0,
                0,   0, 0, 1
            ]));
        };

        var vertexShaderSrc =
                "attribute vec3 pos;" +
                "attribute vec3 color;" +
                "uniform mat4 scale;" +
                "uniform vec4 translation;" +
                "varying vec3 col;" +
                "void main(void) {" +
                "   gl_Position = scale * vec4(pos, 1) + translation;" +
                "   col = color;" +
                "}";


        var fragmentShaderSrc =
                "precision mediump float;" +
                "varying vec3 col;" +
                "void main(void) {" +
                "   gl_FragColor = vec4(col, 1.);" +
                "}";

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
        var scale = gl.getUniformLocation(program, "scale");

        posAttr = gl.getAttribLocation(program, "pos");
        colorAttr = gl.getAttribLocation(program, "color");

        gl.enableVertexAttribArray(posAttr);
        gl.enableVertexAttribArray(colorAttr);

    }
}


function SimpleTileRenderer() {
    this.render = (ctx, tile, tileSize) => {
        tile = tile ? tile : 100;
        ctx.fillStyle = new Color(tile, tile, tile).toFillStyle();
        ctx.fillRect(0, 0, tileSize, tileSize);
    };
}
