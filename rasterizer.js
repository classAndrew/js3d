const canvas = document.querySelector("#cv")

/* (x, y) for x and y in [0, 1.0)
                  + (0.5, 0.5)
                 /| 
                / |
               /  |
 (0.2, 0.2)   +---+ (0.4, 0.3)

*/
pts = [
    [800, 300],
    [400, 700],
    [600, 200]
]

class Slope {
    constructor(p1, p2) {
        Object.assign(this, { p1, p2 });
        // y = mx + b
        // Handle undefined case
        if (p2[0] - p1[0] === 0.0) {
            p1[0] += 0.00001 // Add some bias to the first x coordinate
        }
        this.m = (p2[1] - p1[1]) / (p2[0] - p1[0])
        this.b = p2[1] - p2[0] * this.m
    }

    getY(x) {
        return this.m * x + this.b
    }

    getX(y) {
        return (y - this.b) / this.m
    }
}

const c = canvas.getContext('2d')
const { width, height } = canvas

// takes screen coordinates
function draw() {
    c.clearRect(0, 0, 1000, 1000)
    rasterize(pts)
    setTimeout(() => requestAnimationFrame(draw), 1000);
}
requestAnimationFrame(draw)

function rasterize(pts) {
    c.fillStyle = "#000000"
    pts.sort()
    ptsY = pts.map(e => Array.from(e))
    ptsY.sort((a, b) => a[1] - b[1])
    var s1 = new Slope(pts[0], pts[1]);
    var s2 = new Slope(pts[0], pts[2]);
    var s3 = new Slope(pts[1], pts[2]);

    let middle = pts[2][1]
    let v1 = pts[0][1]
    let v2 = pts[1][1]
    let endSlopes = [s2, s3]
    let beginSlopes = [s1, s1]

    // bend is on the left
    if (pts[0].every((e, i) => e === ptsY[1][i])) {
        middle = pts[0][1]
        v1 = pts[1][1]
        v2 = pts[2][1]
        endSlopes = [s3, s3]
        beginSlopes = [s1, s2]
    }

    // scanline by row to middle
    for (let r = middle; r != v1; r += (middle < v1 ? 1 : -1)) {
        let endX = endSlopes[0].getX(r);
        let startX = beginSlopes[0].getX(r)
        for (let col = startX; col < endX; col++) {
            c.fillRect(col, r, 2, 2)
        }
    }

    //scanline by row from middle to end
    for (let r = middle; r != v2; r += (middle < v2 ? 1 : -1)) {
        let endX = endSlopes[1].getX(r);
        let startX = beginSlopes[1].getX(r)
        for (let col = startX; col < endX; col++) {
            c.fillRect(col, r, 2, 2)
        }
    }

    c.fillStyle = "#FF0000"

    // Plot corner pixels
    c.fillRect(pts[0][0], pts[0][1], 4, 4)
    c.fillRect(pts[1][0], pts[1][1], 4, 4)
    c.fillRect(pts[2][0], pts[2][1], 4, 4)
}