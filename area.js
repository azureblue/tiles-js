function Area(board) {
    var seed = Math.random() * 4294967296 >>> 0;
    var rand = new LCGRandomGenerator(seed);
    var colorRandomizer = new ColorRandomizer(TERRAIN_COLOR_DELTA, rand.randInt);
    var w = board.getWidth();
    var h = board.getHeight();
    var gridVertices;
    var gridTexCoords;
    var gridColors;
    var gridElements;
    var vertexBuffer;
    var texCoordBuffer;
    var elementBuffer;
    var tex;
    var gl;

    this.init = function (glCtx) {        
        gl = glCtx;
        gridVertices = new Float32Array([0, h, w, h, 0, 0, w, 0]);
        gridElements = new Uint16Array([0, 1, 2, 1, 2, 3]);
        gridTexCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

        vertexBuffer = gl.createBuffer();
        texCoordBuffer = gl.createBuffer();
        elementBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridTexCoords, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridVertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gridElements, gl.STATIC_DRAW);
    };

    this.updateAll = function () {
        generateTextureImageData();
    };

    this.draw = function (posAttr, texCordAttr, texSamplerUnif) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCordAttr, 2, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(texSamplerUnif, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.drawElements(gl.TRIANGLES, gridElements.length, gl.UNSIGNED_SHORT, 0);
    };
    
    function generateTextureImageData() {
        rand.seed(seed);
        var black = new Color(0, 0, 0);
        var color = new Color(0, 0, 0);
        var data = new Uint8Array(w * h * 3);
         board.iteratePositions((x, y, v) => {
            var idx = (x + y * w) * 3;
            if (v >= 0)
                color.setToColor(TERRAIN_COLORS[v]);
            else
                color.setToColor(black);
            colorRandomizer.randomize(color, true);
            data[idx + 0] = color.r;
            data[idx + 1] = color.g;
            data[idx + 2] = color.b;            
        });
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
