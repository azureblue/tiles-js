function randInt(range) {
    return Math.floor(Math.random() * range);
}

function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    
    this.toInt = () => (this.r << 16) | (this.g << 8) | this.b;
    this.fromInt = (colorInt) => {
        this.r = (colorInt >> 16) & 255;
        this.g = (colorInt >> 8) & 255;
        this.b = (colorInt >> 0) & 255;
    };
    this.toFillStyle = () => "rgb(" + r + ", " + g + ", " + b + ")";    
}

Color.fromStyle = (col) => {
    let colorInt = Number.parseInt(col.substring(1, 7), 16);
    return new Color((colorInt >> 16) & 255, (colorInt >> 8) & 255, (colorInt >> 0) & 255);
};

function ColorRandomizer(delta) {
    var ca = new Uint8ClampedArray(3);
    this.delta = delta;
    this.randomize = (col) => {
        ca[0] = col.r + randInt(delta * 2) - delta;
        ca[1] = col.g + randInt(delta * 2) - delta;
        ca[2] = col.b + randInt(delta * 2) - delta;
        return new Color(ca[0], ca[1], ca[2]);
    };
}
