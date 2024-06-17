import FLAGS from "./flags.js";

import Vector from "../math/Vector.js";

export default class Renderable {
  /**
   * @param { import("./Scene.js").default } scene
   */
  constructor(scene) {
    /** @type { import("./Scene.js").default } */
    this.scene = scene;

    this.scene.flags |= FLAGS.OBJECTS_COUNT;

    /** @type { Vector } */
    this.temporaryTranslation = Vector.create([0, 0, 0]);
  }

  getGlobalCode() {
    return "";
  }

  getIntersectCode() {
    return "";
  }

  getShadowTestCode() {
    return "";
  }

  getMinimumIntersectCode() {
    return "";
  }

  getNormalCalculationCode() {
    return "";
  }

  setUniforms(renderer) {
    throw new Error("Must be implemented by subclass");
  }

  temporaryTranslate(translation) {
    this.scene.flags |= FLAGS.OBJECTS_POSITION;
  }

  translate(translation) {
    this.scene.flags |= FLAGS.OBJECTS_POSITION;
  }

  getMinCorner() {
    throw new Error("Must be implemented by subclass");
  }

  getMaxCorner() {
    throw new Error("Must be implemented by subclass");
  }

  intersect(origin, ray) {
    return Number.MAX_VALUE;
  }
}
