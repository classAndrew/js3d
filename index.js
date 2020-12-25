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
    beginRender();
}

// get normalized vector
function normalized(vec) {
    const len = Math.sqrt(vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2);
    return [vec[0] / len, vec[1] / len, vec[2] / len];
}

// get vector (cross) product 
function cross(vec1, vec2) {
    return [vec1[1] * vec2[2] - vec1[2] * vec2[1], -(vec1[0] * vec2[2] - vec1[2] * vec2[0]), vec1[0] * vec2[1] - vec1[1] * vec2[0]];
}

class Camera {
    z = 4;
    x = 2;
    y = 1.3;
    pitch = 0;
    yaw = PI / 2;
    speed = 0.005;
    dir = [0, 0, 1];
    worldUp = [0, 1, 0];
    up = this.worldUp;
    right = normalized(cross(this.up, this.dir));
    constructor(x, y, z, pitch, yaw, speed) {
        Object.assign(this, { x, y, z, pitch, yaw, speed });
    }

    getViewMat() {
        // find lookat matrix
        let view = new Mat4();
        view.m[0][0] = this.right[0];
        view.m[0][1] = this.right[1]
        view.m[0][2] = this.right[2];
        view.m[1][0] = this.up[0];
        view.m[1][1] = this.up[1];
        view.m[1][2] = this.up[2];
        view.m[2][0] = this.dir[0];
        view.m[2][1] = this.dir[1];
        view.m[2][2] = this.dir[2];
        view.m[3][3] = 1;
        let coeMat = Mat4.identity();
        coeMat.m[0][3] = -this.x;
        coeMat.m[1][3] = -this.y;
        coeMat.m[2][3] = -this.z;
        return view.mmul(coeMat);
    }

    updateVecs() {
        this.dir[0] = cos(this.yaw) * cos(this.pitch);
        this.dir[1] = sin(this.pitch);
        this.dir[2] = sin(this.yaw) * cos(this.pitch);
        // this.dir = normalized(this.dir);
        this.right = normalized(cross(this.worldUp, this.dir));
        this.up = cross(this.dir, this.right);
    }

    moveForward(dt) {
        this.x += this.dir[0] * dt * this.speed;
        this.z += this.dir[2] * dt * this.speed;
    }

    moveRight(dt) {
        this.x += this.right[0] * dt * this.speed;
        this.z += this.right[2] * dt * this.speed;
    }
}

var keymap = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    ' ': false,
    lastMouseX: 0,
    lastMouseY: 0
}

var cam = new Camera(-2, 1.3, -4, 0, PI / 2, 0.005);

document.onkeydown = e => {
    keymap[e.key.toLowerCase()] = true;
    if (e.key == ' ') e.preventDefault();
}

document.onkeyup = e => {
    keymap[e.key.toLowerCase()] = false;
}


document.addEventListener("onmousemove", e => {
    cam.yaw += e.movementX * 0.05;
    keymap.lastMouseX = e.x;
}, false);

document.addEventListener('pointerlockchange', lockChange, false);

function lockChange() {
    if (document.pointerLockElement === canvas) {
        document.addEventListener("mousemove", (e) => {
            cam.yaw -= e.movementX * 0.002;
            cam.pitch -= e.movementY * 0.002;
        }, false);
    }
}

canvas.onclick = e => {
    canvas.requestPointerLock();
}

function beginRender() {

    // console.log("[" + s.points.map((e) => e.map(b => b[0])).flatMap(e => e).join(", ") + "]" + "," + "[" + s.points.map((e) => e.map(b => b[1])).flatMap(e => e).join(", ") + "]" + ", " + "[" + s.points.map((e) => e.map(b => b[2])).flatMap(e => e).join(", ") + "]")

    var the = 0;
    c.fillStyle = "#000000";

    var dt = 0.1;
    var lastTime = 0;
    let render = () => {
        dt = Date.now() - lastTime;
        lastTime = Date.now();
        c.clearRect(0, 0, width, height)
        let s = new Cube(the);
        // apply world transformations: translate, rotate about camera
        let view = cam.getViewMat();
        let screenPts = s.points.map(e => view.vmul([e[0], e[1], e[2], 1]));
        screenPts = screenPts.map(e => [(e[0]) / (e[2]), (e[1]) / (e[2])]);
        // all the height/2 and width/2 additions is just the viewport transform
        for (var i = 0; i < 36; i += 3) {
            let ox = (screenPts[i][0] * width)
            let oy = -(screenPts[i][1]) * height
            c.beginPath()
            c.moveTo(ox + width / 2, oy + height / 2)
            for (var j = 1; j < 3; j++) {
                scrx = (screenPts[i + j][0] * width)
                scry = -(screenPts[i + j][1]) * height
                c.lineTo(scrx + width / 2, scry + height / 2)
                c.fillRect(scrx + width / 2, scry + height / 2, 4, 4)
            }
            c.lineTo(ox + width / 2, oy + height / 2)
            c.stroke()
        }

        // the += 0.04
        if (keymap.w) {
            cam.moveForward(dt);
        }
        if (keymap.s) {
            cam.moveForward(-dt);
        }
        if (keymap.a) {
            cam.moveRight(-dt);
        }
        if (keymap.d) {
            cam.moveRight(dt);
        }
        if (keymap.shift) cam.y -= cam.speed * dt * 0.8;
        if (keymap[' ']) cam.y += cam.speed * dt * 0.8;
        c.fillRect(width / 2, height / 2, 3, 3);
        // cam.yaw += 0.05;
        cam.updateVecs();
        setTimeout(() => requestAnimationFrame(render), 10);
    }
    requestAnimationFrame(render)
}

/*
          
   0,1,1    +---------+ 1,1,1
           /|        /|
          / |       / |
         /  |      /  |  
  0,1,0 +---------+   + 1,0,1  
        |  /0,0,1 |  /
        | /       | / 1,1,0 (top right, front)
        |/        |/
        +---------+
    0,0,0        1,0,0
*/
class Cube {
    points = [
        // bottom face
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
        [0, 0, 1],
        [1, 0, 1],
        [1, 0, 0],
        //front face
        [0, 0, 0],
        [0, 1, 0],
        [1, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
        //left face
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        // right face
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1],
        // top face
        [0, 1, 0],
        [0, 1, 1],
        [1, 1, 0],
        [1, 1, 1],
        [0, 1, 1],
        [1, 1, 0],
        // back face
        [0, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [0, 0, 1],
        [0, 1, 1],
        [1, 1, 1]
    ]
    constructor(the) {
        for (var i = 0; i < 36; i++) {
            // this.points[i][0] -= 0.5
            // this.points[i][1] -= 0.5
            // this.points[i][2] -= 0.5
            this.points[i] = [this.points[i][0] * cos(the) + this.points[i][2] * sin(the), this.points[i][1], -this.points[i][0] * sin(the) + cos(the) * this.points[i][2]]
        }
    }
}

class Mat4 {
    m;
    constructor() {
        this.m = [...Array(4)].map(_ => Array(4).fill(0))
    }

    // since we're really just taking in another vector to perform this transformation, no need for a full mat4
    vmul(v) {
        let res = [0, 0, 0, 0]
        return res.map((_, n) => v.map((e1, j) => e1 * this.m[n][j]).reduce((su, ne) => su + ne));
    }
    mmul(mat) {
        let res = new Mat4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                res.m[i][j] = this.m[i].map((e, idx) => e * mat.m[idx][j]).reduce((x, y) => x + y);
            }
        }
        return res;
    }
    static identity() {
        let m = new Mat4()
        for (let i = 0; i < 4; i++) m.m[i][i] = 1;
        return m;
    }
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

main();