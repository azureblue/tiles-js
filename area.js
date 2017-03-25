function Area(board) {
    var seed = Math.random() * 4294967296 >>> 0;
    var rand = new LCGRandomGenerator(seed);
    var colorRandomizer = new ColorRandomizer(TERRAIN_COLOR_DELTA, rand.randInt);
    var w = board.getWidth();
    var h = board.getHeight();
    var gridVertices;
    var gridColors;
    var gridElements;
    var vertexBuffer;
    var colorBuffer;
    var elementBuffer;
    var gl;

    this.init = function (glCtx) {
        gl = glCtx;
        gridVertices = new Float32Array(w * h * 8);
        gridColors = new Float32Array(w * h * 12);
        gridElements = new Uint16Array(w * h * 6);

        var vertex = 0;
        var element = 0;
        var vertexElement = 0;

        board.iteratePositions((x, y, v) => {
            gridElements[element++] = vertexElement;
            gridElements[element++] = vertexElement + 1;
            gridElements[element++] = vertexElement + 2;

            gridElements[element++] = vertexElement + 1;
            gridElements[element++] = vertexElement + 2;
            gridElements[element++] = vertexElement + 3;
            vertexElement += 4;

            gridVertices[vertex++] = x;
            gridVertices[vertex++] = h - y;

            gridVertices[vertex++] = x + 1;
            gridVertices[vertex++] = h - y;

            gridVertices[vertex++] = x;
            gridVertices[vertex++] = h - (y + 1);

            gridVertices[vertex++] = x + 1;
            gridVertices[vertex++] = h - (y + 1);
        });

        vertexBuffer = gl.createBuffer();
        colorBuffer = gl.createBuffer();
        elementBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridVertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gridElements, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridColors, gl.DYNAMIC_DRAW);
    };

    this.updateAll = function () {
        var vertexColor = 0;
        var black = new Color(0, 0, 0);
        var color = new Color(0, 0, 0);
        rand.seed(seed);
        board.iteratePositions((x, y, v) => {
            if (v >= 0)
                color.setToColor(TERRAIN_COLORS[v]);
            else
                color.setToColor(black);
            colorRandomizer.randomize(color, true);
            var r = color.r / 255;
            var g = color.g / 255;
            var b = color.b / 255;
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
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridColors, gl.DYNAMIC_DRAW);
    };

    this.draw = function (posAttr, colorAttr) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        //gl.enableVertexAttribArray(posAttr);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 0, 0);
        //gl.enableVertexAttribArray(colorAttr);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.drawElements(gl.TRIANGLES, gridElements.length, gl.UNSIGNED_SHORT, 0);
    };
}
