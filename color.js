function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
}

Color.prototype = {};

Color.prototype.toInt = function() {
    return (this.r << 16) | (this.g << 8) | this.b;
};

Color.prototype.setToColor = function(col) {
    this.r = col.r;
    this.g = col.g;
    this.b = col.b;
};

Color.prototype.toFillStyle = function() {
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
};

Color.fromInt = (colorInt) => {
    return new Color((colorInt >> 16) & 255, (colorInt >> 8) & 255, (colorInt >> 0) & 255);
};

Color.fromStyle = (col) => {
    let colorInt = Number.parseInt(col.substring(1, 7), 16);
    return new Color((colorInt >> 16) & 255, (colorInt >> 8) & 255, (colorInt >> 0) & 255);
};

function ColorRandomizer(delta, randInt = range => Math.floor(Math.random() * range)) {
    var ca = new Uint8ClampedArray(3);
    this.delta = delta;
    this.randomize = (col, inPlace = false) => {
        ca[0] = col.r + randInt(delta * 2) - delta;
        ca[1] = col.g + randInt(delta * 2) - delta;
        ca[2] = col.b + randInt(delta * 2) - delta;
        if (inPlace) {
            col.r = ca[0];
            col.g = ca[1];
            col.b = ca[2];
            return col;
        } else
            return new Color(ca[0], ca[1], ca[2]);
    };
}
