import Renderable from "../Renderable.js";
import Vector from "../../math/Vector.js";

export default class Cube extends Renderable {
  static intersect(origin, ray, cubeMin, cubeMax) {
    const tMin = cubeMin.subtract(origin).componentDivide(ray);
    const tMax = cubeMax.subtract(origin).componentDivide(ray);
    const t1 = Vector.min(tMin, tMax);
    const t2 = Vector.max(tMin, tMax);
    const tNear = t1.maxComponent();
    const tFar = t2.minComponent();
    if (tNear > 0 && tNear < tFar) {
      return tNear;
    }
    return Number.MAX_VALUE;
  }

  /**
   * @param { import("../Scene.js").default} scene
   * @param { Vector } minCorner
   * @param { Vector } maxCorner
   * @param { number } id
   */
  constructor(scene, minCorner, maxCorner, id) {
    super(scene);

    this.minCorner = minCorner;
    this.maxCorner = maxCorner;
    this.minStr = `cubeMin${id}`;
    this.maxStr = `cubeMax${id}`;
    this.intersectStr = `tCube${id}`;
  }
  getGlobalCode() {
    return `
      uniform vec3 ${this.minStr};
      uniform vec3 ${this.maxStr};
      `;
  }

  getIntersectCode() {
    return `
      vec2 ${this.intersectStr} = intersectCube(origin, ray, ${this.minStr}, ${this.maxStr});
      `;
  }

  getShadowTestCode() {
    return `
      ${this.getIntersectCode()}
      if (${this.intersectStr}.x > 0.0 && ${this.intersectStr}.x < 1.0 && ${
      this.intersectStr
    }.x < ${this.intersectStr}.y) return 0.0;
    `;
  }

  getMinimumIntersectCode() {
    return `
      if(${this.intersectStr}.x > 0.0 && ${this.intersectStr}.x < ${this.intersectStr}.y && ${this.intersectStr}.x < t) t = ${this.intersectStr}.x;
    `;
  }

  getNormalCalculationCode() {
    // have to compare intersectStr.x < intersectStr.y otherwise two coplanar
    // cubes will look wrong (one cube will "steal" the hit from the other)
    return `
      else if(t == ${this.intersectStr}.x && ${this.intersectStr}.x < ${this.intersectStr}.y) normal = normalForCube(hit, ${this.minStr}, ${this.maxStr});
    `;
  }

  setUniforms(renderer) {
    renderer.uniforms[this.minStr] = this.getMinCorner();
    renderer.uniforms[this.maxStr] = this.getMaxCorner();
  }

  temporaryTranslate(translation) {
    super.temporaryTranslate(translation);

    this.temporaryTranslation = translation;
  }

  translate(translation) {
    super.translate(translation);

    this.minCorner = this.minCorner.add(translation);
    this.maxCorner = this.maxCorner.add(translation);
  }

  getMinCorner() {
    return this.minCorner.add(this.temporaryTranslation);
  }

  getMaxCorner() {
    return this.maxCorner.add(this.temporaryTranslation);
  }

  intersect(origin, ray) {
    return Cube.intersect(
      origin,
      ray,
      this.getMinCorner(),
      this.getMaxCorner()
    );
  }
}
