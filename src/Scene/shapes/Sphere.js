import Renderable from "../Renderable.js";
import Vector from "../../math/Vector.js";

export default class Sphere extends Renderable {
  static intersect(origin, ray, center, radius) {
    const toSphere = origin.subtract(center);
    const a = ray.dot(ray);
    const b = 2 * toSphere.dot(ray);
    const c = toSphere.dot(toSphere) - radius * radius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant > 0) {
      const t = (-b - Math.sqrt(discriminant)) / (2 * a);
      if (t > 0) {
        return t;
      }
    }
    return Number.MAX_VALUE;
  }

  /**
   * @param { import("../Scene.js").default} scene
   * @param { Vector } minCorner
   * @param { Vector } maxCorner
   * @param { number } id
   */
  constructor(scene, center, radius, id) {
    super(scene);

    this.center = center;
    this.radius = radius;
    this.centerStr = `sphereCenter${id}`;
    this.radiusStr = `sphereRadius${id}`;
    this.intersectStr = `tSphere${id}`;
  }
  getGlobalCode() {
    return `
      uniform vec3 ${this.centerStr};
      uniform float ${this.radiusStr};
      `;
  }

  getIntersectCode() {
    return `
      float ${this.intersectStr} = intersectSphere(origin, ray, ${this.centerStr}, ${this.radiusStr});
      `;
  }

  getShadowTestCode() {
    return `
      ${this.getIntersectCode()}
      if (${this.intersectStr} < 1.0) return 0.0;
    `;
  }

  getMinimumIntersectCode() {
    return `
      if(${this.intersectStr} < t) t = ${this.intersectStr};
    `;
  }

  getNormalCalculationCode() {
    return `
      else if(t == ${this.intersectStr}) normal = normalForSphere(hit, ${this.centerStr}, ${this.radiusStr});
    `;
  }

  setUniforms(renderer) {
    renderer.uniforms[this.centerStr] = this.center.add(
      this.temporaryTranslation
    );
    renderer.uniforms[this.radiusStr] = this.radius;
  }

  temporaryTranslate(translation) {
    super.temporaryTranslate(translation);

    this.temporaryTranslation = translation;
  }

  translate(translation) {
    super.translate(translation);

    this.center = this.center.add(translation);
  }

  getMinCorner() {
    return this.center
      .add(this.temporaryTranslation)
      .subtract(Vector.create([this.radius, this.radius, this.radius]));
  }

  getMaxCorner() {
    return this.center
      .add(this.temporaryTranslation)
      .add(Vector.create([this.radius, this.radius, this.radius]));
  }

  intersect(origin, ray) {
    return Sphere.intersect(
      origin,
      ray,
      this.center.add(this.temporaryTranslation),
      this.radius
    );
  }
}
