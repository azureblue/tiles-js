function Area(board) {
    const size = board.getWidth();
    if (size !== board.getHeight() || size % 2 !== 0)
        throw "invalid board size";    
    const initialSeed = Math.random() * 4294967296 | 0;    
    var randGen = new LCGRandomGenerator(initialSeed);
    var colorRandomizer = new ColorRandomizer(TERRAIN_COLOR_DELTA, randGen.randInt);
    var tex;
    var texPixelArray;
    var vertices;
    var texCoords;
    var vertexBuffer;
    var texCoordBuffer;
    var gl;

    this.init = function (glCtx) {        
        gl = glCtx;
        vertices = new Float32Array([0, size, size, size, 0, 0, size, size, 0, 0, size, 0]);
        texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1]);

        vertexBuffer = gl.createBuffer();
        texCoordBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        initTexture();
    };

    this.updateAll = function () {
        updateTexture();
    };

    this.draw = function (posAttr, texCordAttr, texSamplerUnif) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCordAttr, 2, gl.FLOAT, false, 0, 0);        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(texSamplerUnif, 0);        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    
    function initTexture() {
        texPixelArray = new Uint8Array(size * size * 3);
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, texPixelArray);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    function updateTexture() {
        randGen.seed(initialSeed);
        var black = new Color(0, 0, 0);
        var color = new Color(0, 0, 0);
        board.iteratePositions((x, y, v) => {
            var idx = (x + y * size) * 3;
            color.setToColor(v < 0 ? black : TERRAIN_COLORS[v]);            
            colorRandomizer.randomize(color, true);
            texPixelArray[idx + 0] = color.r;
            texPixelArray[idx + 1] = color.g;
            texPixelArray[idx + 2] = color.b;            
        });
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, size, size, gl.RGB, gl.UNSIGNED_BYTE, texPixelArray);
    }
}
