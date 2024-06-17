import Renderable from "./Renderable.js";
import Vector from "../math/Vector.js";

export default class Light extends Renderable {
  static SIZE = 0.1;

  static clampPosition(position) {
    for (let i = 0; i < position.elements.length; i++) {
      position.elements[i] = Math.max(
        Light.SIZE - 1,
        Math.min(1 - Light.SIZE, position.elements[i])
      );
    }
  }

  constructor(scene) {
    super(scene);

    /** @type { Vector } */
    this.position = Vector.create([0.4, 0.5, -0.6]);
  }

  getGlobalCode() {
    return "uniform vec3 light;";
  }

  setUniforms(renderer) {
    renderer.uniforms.light = this.position.add(this.temporaryTranslation);
  }

  temporaryTranslate(translation) {
    super.temporaryTranslate(translation);

    const tempLight = this.position.add(translation);
    Light.clampPosition(tempLight);
    this.temporaryTranslation = tempLight.subtract(this.position);
  }

  translate(translation) {
    super.translate(translation);

    this.position = this.position.add(translation);
    Light.clampPosition(this.position);
  }

  getMinCorner() {
    return this.position
      .add(this.temporaryTranslation)
      .subtract(Vector.create([Light.SIZE, Light.SIZE, Light.SIZE]));
  }

  getMaxCorner() {
    return this.position
      .add(this.temporaryTranslation)
      .add(Vector.create([Light.SIZE, Light.SIZE, Light.SIZE]));
  }
}
