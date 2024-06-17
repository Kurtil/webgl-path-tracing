import Vector from "../math/Vector.js";
import Matrix from "../math/Matrix.js";

import FLAGS from "./flags.js";

export default class Camera {
  //
  // gluLookAt
  //
  static makeLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
    const eye = Vector.create([ex, ey, ez]);
    const center = Vector.create([cx, cy, cz]);
    const up = Vector.create([ux, uy, uz]);

    const z = eye.subtract(center).toUnitVector();
    const x = up.cross(z).toUnitVector();
    const y = z.cross(x).toUnitVector();

    const m = Matrix.create([
      [x.e(1), x.e(2), x.e(3), 0],
      [y.e(1), y.e(2), y.e(3), 0],
      [z.e(1), z.e(2), z.e(3), 0],
      [0, 0, 0, 1],
    ]);

    const t = Matrix.create([
      [1, 0, 0, -ex],
      [0, 1, 0, -ey],
      [0, 0, 1, -ez],
      [0, 0, 0, 1],
    ]);

    return m.x(t);
  }

  //
  // gluPerspective
  //
  static makePerspective(fovy, aspect, znear, zfar) {
    const ymax = znear * Math.tan((fovy * Math.PI) / 360.0);
    const ymin = -ymax;
    const xmin = ymin * aspect;
    const xmax = ymax * aspect;

    return Camera.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
  }

  //
  // glFrustum
  //
  static makeFrustum(left, right, bottom, top, znear, zfar) {
    const X = (2 * znear) / (right - left);
    const Y = (2 * znear) / (top - bottom);
    const A = (right + left) / (right - left);
    const B = (top + bottom) / (top - bottom);
    const C = -(zfar + znear) / (zfar - znear);
    const D = (-2 * zfar * znear) / (zfar - znear);

    return Matrix.create([
      [X, 0, A, 0],
      [0, Y, B, 0],
      [0, 0, C, D],
      [0, 0, -1, 0],
    ]);
  }

  /**
   * @param { import("./Scene.js").default } scene 
   */
  constructor(scene) {
    /** @type { import("./Scene.js").default } */
    this.scene = scene;

    this._angleX = 0;
    this._angleY = 0;

    this.zoomZ = 2.5;

    /** @type { Vector } */
    this._cachedEye = null;
    /** @type { Matrix } */
    this._cachedModelviewProjection = null;

    this.angleX = 0;
    this.angleY = 0;
  }

  get eye() {
    if (!this._cachedEye) {
      const eye = Vector.create([0, 0, 0]);
  
      eye.elements[0] =
        this.zoomZ * Math.sin(this.angleY) * Math.cos(this.angleX);
      eye.elements[1] = this.zoomZ * Math.sin(this.angleX);
      eye.elements[2] =
        this.zoomZ * Math.cos(this.angleY) * Math.cos(this.angleX);
  
      this._cachedEye = Object.freeze(eye);
    }

    return this._cachedEye;
  }

  get modelviewProjection() {
    if (!this._cachedModelviewProjection) {
      const { eye } = this;
      const modelview = Camera.makeLookAt(
        eye.elements[0],
        eye.elements[1],
        eye.elements[2],
        0,
        0,
        0,
        0,
        1,
        0
      );
      const projection = Camera.makePerspective(55, 1, 0.1, 100);
      this._cachedModelviewProjection = projection.multiply(modelview);
    }

    return this._cachedModelviewProjection;
  }

  get angleX() {
    return this._angleX;
  }

  set angleX(value) {
    this._angleX = value;
    this._cachedEye = null;
    this._cachedModelviewProjection = null;
    this.scene.flags |= FLAGS.CAMERA;
  }

  get angleY() {
    return this._angleY;
  }

  set angleY(value) {
    this._angleY = value;
    this._cachedEye = null;
    this._cachedModelviewProjection = null;
    this.scene.flags |= FLAGS.CAMERA;
  }

  getEyeRay(matrix, x, y) {
    return matrix
      .multiply(Vector.create([x, y, 0, 1]))
      .divideByW()
      .ensure3()
      .subtract(this.eye);
  }
}
