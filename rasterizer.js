const canvas = document.querySelector("#cv")

/* (x, y) for x and y in [0, 1.0)
                  + (0.5, 0.5)
                 /| 
                / |
               /  |
 (0.2, 0.2)   +---+ (0.4, 0.3)

*/
pts = [
    [300, 201, 255, 0, 0],
    [300, 450, 0, 0, 255],
    [600, 200, 0, 255, 0]
]
pts.sort()
ptsY = pts.map(e => Array.from(e))
ptsY.sort((a, b) => a[1] - b[1])
var slider = document.querySelector('#yslider')
slider.onmousemove = e => {
    if (e.buttons) {
        ptsY[1][1] = slider.value
        ptsY.sort((a, b) => a[1] - b[1])
    }
}
class Slope {
    constructor(point1, point2) {
        // Object.assign(this, { p1, p2 });
        let p1 = point1
        let p2 = point2
            // y = mx + b
            // Handle undefined case
        if (p2[0] - p1[0] === 0.0) {
            p1[0] += 0.001 // Add some bias to the first x coordinate
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
    rasterize()
    setTimeout(() => requestAnimationFrame(draw), 1000);
}
requestAnimationFrame(draw)

// linearly interpolate between a and b by q
function lerp(a, b, q) {
    return a + (b - a) * q
}

function rasterize() {
    c.fillStyle = "#000000"

    // bend is on the left
    // the middle point sorted by y coord is the bending point
    const s1 = new Slope(ptsY[1], ptsY[0]);
    const s2 = new Slope(ptsY[1], ptsY[2]);
    const s3 = new Slope(ptsY[2], ptsY[0]);

    // top to middle
    for (let y = ptsY[0][1]; y < ptsY[1][1]; y++) {
        let startX = s1.getX(y)
        let endX = s3.getX(y);
        for (let x = startX; x < endX; x++) {
            // can be optimized- no recomputation for some parts
            let wv1 = (ptsY[1][1] - ptsY[2][1]) * (x - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (y - ptsY[2][1])
            let wvd1 = (ptsY[1][1] - ptsY[2][1]) * (ptsY[0][0] - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (ptsY[0][1] - ptsY[2][1])

            let wv2 = (ptsY[2][1] - ptsY[0][1]) * (x - ptsY[2][0]) + (ptsY[0][0] - ptsY[2][0]) * (y - ptsY[2][1])
            wv1 = wv1 / wvd1
            wv2 = wv2 / wvd1
            let wv3 = Math.max(0, 1 - wv1 - wv2)
                // interpolate the colors: RGB
            let r = Math.floor(wv1 * ptsY[0][2] + wv2 * ptsY[1][2] + wv3 * ptsY[2][2])
            let g = Math.floor(wv1 * ptsY[0][3] + wv2 * ptsY[1][3] + wv3 * ptsY[2][3])
            let b = Math.floor(wv1 * ptsY[0][4] + wv2 * ptsY[1][4] + wv3 * ptsY[2][4])
                // let s16 = Math.floor(0x100 * (x - startX) / (endX - startX)).toString(16)
            let s16 = ((r << 16) + (g << 8) + b).toString(16)
            c.fillStyle = "#" + "0".repeat(6 - s16.length) + s16
            c.fillRect(x, y, 2, 2)
        }
    }

    // middle to bottom
    for (let y = ptsY[1][1]; y < ptsY[2][1]; y++) {
        let startX = s2.getX(y)
        let endX = s3.getX(y);

        for (let x = startX; x < endX; x++) {
            // find baycentric weights
            let wv1 = (ptsY[1][1] - ptsY[2][1]) * (x - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (y - ptsY[2][1])
            let wvd1 = (ptsY[1][1] - ptsY[2][1]) * (ptsY[0][0] - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (ptsY[0][1] - ptsY[2][1])

            let wv2 = (ptsY[2][1] - ptsY[0][1]) * (x - ptsY[2][0]) + (ptsY[0][0] - ptsY[2][0]) * (y - ptsY[2][1])
            wv1 = wv1 / wvd1
            wv2 = wv2 / wvd1
            let wv3 = Math.max(0, 1 - wv1 - wv2)
                // interpolate the colors: RGB
            let r = Math.floor(wv1 * ptsY[0][2] + wv2 * ptsY[1][2] + wv3 * ptsY[2][2])
            let g = Math.floor(wv1 * ptsY[0][3] + wv2 * ptsY[1][3] + wv3 * ptsY[2][3])
            let b = Math.floor(wv1 * ptsY[0][4] + wv2 * ptsY[1][4] + wv3 * ptsY[2][4])
                // let s16 = Math.floor(0x100 * (x - startX) / (endX - startX)).toString(16)
            let s16 = ((r << 16) + (g << 8) + b).toString(16)

            c.fillStyle = "#" + "0".repeat(6 - s16.length) + s16
            c.fillRect(x, y, 2, 2)
        }
    }


    c.fillStyle = "#FF0000"

    // Plot vertex pixels
    c.fillRect(ptsY[0][0], ptsY[0][1], 4, 4)
    c.fillRect(ptsY[1][0], ptsY[1][1], 4, 4)
    c.fillRect(ptsY[2][0], ptsY[2][1], 4, 4)
}