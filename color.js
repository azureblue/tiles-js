function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
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
        return new Color(...ca);
    };
}
