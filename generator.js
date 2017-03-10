function RandomGenerator(values, weights) {
    var weightSum = weights.reduce((a, b) => a + b);
    this.generate = (board) => {
        let w = board.getWidth();
        let h = board.getHeight();
        for (let i = 0; i < w; i++)
            for (let j = 0; j < h; j++) {
                let r = Math.random() * weightSum;
                let idx = 0;
                let weight = weights[0];
                while (weight < r)
                    weight += weights[++idx];
                board.set(i, j, values[idx]);    
            }
    };
}
