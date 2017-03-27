function LCGRandomGenerator(seed = 0) {
    var ar = new Uint32Array([seed]);
    var a = 1664525, c = 1013904223;
    var nextRand = () => { 
        ar[0] = (ar[0] * a + c);
        return ar[0];
    };
    this.seed = seed => ar[0] = seed;
    this.rand = () =>  nextRand() / 4294967296;
    this.randInt = (range) => nextRand() % range;
}

function randomBool(prob = 0.5) {
    return Math.random() < prob;
}

function weightedRandomBool(w1, w2) {
    return Math.random() * (w1 + w2) > w1;
}

function weightedProb(values, weights) {
    var weightSum = 0;
    for (var i = 0; i < weights.length; i++)
        weightSum += weights[i];
    if (weightSum <= 0)
        throw "illegal state: weights sum <= 0";
    var r = Math.random() * weightSum;
    var idx = 0;
    var weight = weights[0];
    while (weight < r)
        weight = weight + weights[++idx];
    return values[idx];
}
