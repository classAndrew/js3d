const canvas = document.querySelector("#cv")
const c = canvas.getContext("2d")
const { PI, cos, sin, tan } = Math
const [a0, a1, b0, b1] = [0, 2 * PI, 0, PI]
const FOV = 1 / tan(50 / 2)

/*
        y+
        |
        |
        |
        |
        +--------- x+
       /
      /
     /
   z+

*/
function main() {
    beginRender()
}

function beginRender() {
    let render = () => {
        c.clearRect(0, 0, c.width, c.height)
        setTimeout(() => requestAnimationFrame(render), 100);
    }
    requestAnimationFrame(render)
}

class Solid {
    points;
    r = 3
    constructor() {
        const PREC = 20;
        this.points = Array(PREC).fill(Array(PREC))
        for (let i = 0; i < PREC; i++) {
            let u = (a1 - a0) * (i / PREC)
            for (let j = 0; j < PREC; j++) {
                let v = (b1 - b0) * (j / PREC)
                this.points[i][j] = [this.x(u, v), this.y(u, v), this.z(u, v)]
            }
        }
    }
    x(u, v) {
        return this.r * sin(v) * cos(u)
    }

    y(u, v) {
        return this.r * cos(v)
    }

    z(u, v) {
        return this.r * sin(v) * sin(u)
    }
}

class Mat4 {
    mat;
    constructor() {
        this.mat = Array(4).fill(Array(4))
    }

    // since we're really just taking in another vector to perform this transformation, no need for a full mat4
    mul(v) {
        let res = [0, 0, 0, 1]
        res.map((_, n) => v.map((e1, j) => e1 * this.mat[n][j]).reduce((s, n) => s + n))
        return res;
    }
    static identity() {
        let m = new Mat4()
        for (let i = 0; i < 4; i++) m[i][i] = 1;
        return m;
    }
    static clip() {
        let m = new Mat4()

    }
}
main();