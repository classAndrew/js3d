const canvas = document.querySelector("#cv");

// rasterizing step by
const rastStep = 5;
// pixel size
const pixSize = rastStep + 1;

var ptmap = {
    a: [220, 500, 255, 0, 0],
    b: [268, 134, 0, 0, 255],
    c: [600, 200, 0, 255, 0]
};

ptsY = [ptmap.a, ptmap.b, ptmap.c];
ptsY.sort((a, b) => a[1] - b[1]);

// code for moving points 2d on screen
var nearPt = null;
var nearDsq = 1e6;

canvas.onmouseup = e => {
    nearPt = null;
    nearDsq = 1e6;
};

canvas.onmousedown = e => {
    if (!nearPt) {
        nearPt = null;
        nearDsq = 1e6;
        for (pt of Object.keys(ptmap)) {
            let dsq = (ptmap[pt][0] - e.x) ** 2 + (ptmap[pt][1] - e.y) ** 2;
            if (dsq < nearDsq) {
                nearPt = ptmap[pt];
                nearDsq = dsq;
            }
        }
    }
};

canvas.onmousemove = e => {
    if (e.buttons) {
        // console.log(e.x, e.y)
        nearPt[0] = e.x;
        nearPt[1] = e.y;
        // ptsY.sort((a, b) => a[1] - b[1])
    }
};

class Slope {
    constructor(point1, point2) {
        // Object.assign(this, { p1, p2 });
        let p1 = point1.map(e => e);
        let p2 = point2.map(e => e);
        // y = mx + b
        // Handle undefined case
        if (p2[0] - p1[0] === 0.0) {
            p1[0] += 0.001; // Add some bias to the first x coordinate
        }
        // handle horizontal case
        if (p2[1] - p1[1] === 0.0) {
            p1[1] += 0.001; // Add some bias to the first x coordinate
        }
        this.m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
        this.b = p2[1] - p2[0] * this.m;
    }

    getY(x) {
        return this.m * x + this.b;
    }

    getX(y) {
        return (y - this.b) / this.m;
    }
}

const c = canvas.getContext('2d');
const { width, height } = canvas;

// takes screen coordinates
function draw() {
    c.clearRect(0, 0, 1000, 1000);
    drawScreen();
    setTimeout(() => requestAnimationFrame(draw), 10);
}
requestAnimationFrame(draw);

// linearly interpolate between a and b by q
function lerp(a, b, q) {
    return a + (b - a) * q;
}

function drawScreen() {
    c.fillStyle = "#000000";
    rasterizeTriangle(ptsY);
}

function rasterizeTriangle(ptsY) {

    ptsY.sort((a, b) => a[1] - b[1]);

    var s1 = new Slope(ptsY[1], ptsY[0]);
    var s2 = new Slope(ptsY[1], ptsY[2]);
    var s3 = new Slope(ptsY[2], ptsY[0]);

    // the middle point sorted by y coord is the bending point
    // find cross prod to find bend
    let k_comp = (ptsY[0][0] - ptsY[1][0]) * (ptsY[2][1] - ptsY[1][1]) - (ptsY[0][1] - ptsY[1][1]) * (ptsY[2][0] - ptsY[1][0]);
    // bend is on the left
    var isLeft = k_comp > 0 // (ptsY[1][0] == pts[0][0] && ptsY[1][1] == pts[0][1]) || (ptsY[1][0] == pts[1][0] && ptsY[1][1] == pts[1][1])
        // console.log(isLeft)
    var wvd1 = (ptsY[1][1] - ptsY[2][1]) * (ptsY[0][0] - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (ptsY[0][1] - ptsY[2][1]);
    // top to middle
    for (let y = ptsY[0][1]; y < ptsY[1][1]; y += rastStep) {
        let startX = s3.getX(y);
        let endX = s1.getX(y);
        if (isLeft) {
            let temp = startX;
            startX = endX;
            endX = temp;
        }
        for (let x = startX; x < endX; x += rastStep) {
            let wv1 = (ptsY[1][1] - ptsY[2][1]) * (x - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (y - ptsY[2][1]);

            let wv2 = (ptsY[2][1] - ptsY[0][1]) * (x - ptsY[2][0]) + (ptsY[0][0] - ptsY[2][0]) * (y - ptsY[2][1]);
            wv1 = Math.max(0, wv1 / wvd1);
            wv2 = Math.max(0, wv2 / wvd1);
            let wv3 = Math.max(0, 1 - wv1 - wv2);
            // pass to fragment shader
            fragment(wv1, wv2, wv3, x, y, ptsY)
        }
    }

    // middle to bottom
    for (let y = ptsY[1][1]; y < ptsY[2][1]; y += rastStep) {
        let startX = s3.getX(y);
        let endX = s2.getX(y);
        if (isLeft) {
            let temp = startX;
            startX = endX;
            endX = temp;;
        }
        for (let x = startX; x < endX; x += rastStep) {
            // find baycentric weights
            let wv1 = (ptsY[1][1] - ptsY[2][1]) * (x - ptsY[2][0]) + (ptsY[2][0] - ptsY[1][0]) * (y - ptsY[2][1]);

            let wv2 = (ptsY[2][1] - ptsY[0][1]) * (x - ptsY[2][0]) + (ptsY[0][0] - ptsY[2][0]) * (y - ptsY[2][1]);
            wv1 = Math.max(0, wv1 / wvd1);
            wv2 = Math.max(0, wv2 / wvd1);
            let wv3 = Math.max(0, 1 - wv1 - wv2);
            // pass to fragment shader
            fragment(wv1, wv2, wv3, x, y, ptsY)
        }
    }

    c.fillStyle = "#000000";

    // Plot vertex pixels
    c.fillRect(ptsY[0][0], ptsY[0][1], pixSize, pixSize);
    c.fillRect(ptsY[1][0], ptsY[1][1], pixSize, pixSize);
    c.fillRect(ptsY[2][0], ptsY[2][1], pixSize, pixSize);
}

// likened to a fragment shader in GLSL
function fragment(wv1, wv2, wv3, x, y, ptsY) {
    // interpolate the colors: RGB
    let r = Math.floor(wv1 * ptsY[0][2] + wv2 * ptsY[1][2] + wv3 * ptsY[2][2]);
    let g = Math.floor(wv1 * ptsY[0][3] + wv2 * ptsY[1][3] + wv3 * ptsY[2][3]);
    let b = Math.floor(wv1 * ptsY[0][4] + wv2 * ptsY[1][4] + wv3 * ptsY[2][4]);
    // let s16 = Math.floor(0x100 * (x - startX) / (endX - startX)).toString(16)
    let s16 = ((r << 16) + (g << 8) + b).toString(16);

    c.fillStyle = "#" + "0".repeat(6 - s16.length) + s16;

    c.fillRect(x, y, pixSize, pixSize);
}