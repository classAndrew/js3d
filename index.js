const canvas = document.querySelector("#cv")
const c = canvas.getContext("2d")
const { PI, cos, sin, tan } = Math
const { width, height } = canvas
const [a0, a1, b0, b1] = [0, 2 * PI, 0, 2 * PI]
const FOV = 1 / tan(PI / 3 / 2)
const ASPECTRATIO = width / height
const [NEAR, FAR] = [0, 10]
const PREC = 80;

/*
    Cartesion Coordinate system

        y+
        |
        |
        |
        |
        +--------- x+
       /
      /
     /
   z- (this axis is facing you)

*/
function main() {
    beginRender()
}

function beginRender() {

    // console.log("[" + s.points.map((e) => e.map(b => b[0])).flatMap(e => e).join(", ") + "]" + "," + "[" + s.points.map((e) => e.map(b => b[1])).flatMap(e => e).join(", ") + "]" + ", " + "[" + s.points.map((e) => e.map(b => b[2])).flatMap(e => e).join(", ") + "]")

    var the = 0
    c.fillStyle = "#000000"
    let s = new Solid(the)
    let screenPts = s.points.map((e) => e.map((f) => [f[0] / f[2], f[1] / f[2]]))
    let render = () => {
        c.clearRect(0, 0, width, height)

        for (let i = 0; i < PREC; i++) {
            for (let j = 0; j < PREC; j++) {


                scrx = (screenPts[i][j][0] * width)
                scry = (1 - (screenPts[i][j][1] + 1) / 2) * height
                    //console.log(scrx, scry)
                c.fillRect(scrx, scry, 2, 2)
            }
        }
        the += 0.04
        setTimeout(() => requestAnimationFrame(render), 100);
    }
    requestAnimationFrame(render)
}

class Solid {
    points = [...Array(PREC)].map(_ => Array(PREC))
    r = 10
    constructor(the) {
        for (let i = 0; i < PREC; i++) {
            let u = (a1 - a0) * (i / PREC)
            for (let j = 0; j < PREC; j++) {
                let v = (b1 - b0) * (j / PREC)
                this.points[i][j] = [this.x(u, v), this.y(u, v), this.z(u, v), 1]
                this.points[i][j] = [this.points[i][j][0] * cos(the) + this.points[i][j][2] * sin(the), this.points[i][j][1], -this.points[i][j][0] * sin(the) + cos(the) * this.points[i][j][2]]

            }
        }
    }
    x(u, v) {
        return (2 + cos(v)) * cos(u) + 2 // this.r * sin(v) * cos(u)
    }

    y(u, v) {
        return sin(v) // this.r * cos(v)
    }

    z(u, v) {
        return 5 + (2 + cos(v)) * sin(u) // this.r * sin(v) * sin(u) + this.r * 2
    }
}

class Mat4 {
    mat;
    constructor() {
        this.mat = Array(4).fill(Array(4).fill(0))
    }

    // since we're really just taking in another vector to perform this transformation, no need for a full mat4
    mul(v) {
        let res = [0, 0, 0, 0]

        return res.map((_, n) => v.map((e1, j) => e1 * this.mat[n][j]).reduce((su, ne) => su + ne));
    }
    static identity() {
        let m = new Mat4()
        for (let i = 0; i < 4; i++) m.mat[i][i] = 1;
        return m;
    }
}

main();