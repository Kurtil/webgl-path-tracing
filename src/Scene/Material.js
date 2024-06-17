import Scene from "./Scene.js";
import FLAGS from "./flags.js";

export default class Material {
  static MATERIAL_DIFFUSE = 0;
  static MATERIAL_MIRROR = 1;
  static MATERIAL_GLOSSY = 2;

  /**
   * @param { import("./Scene.js").default } scene 
   */
  constructor(scene) {
    /** @type { import("./Scene.js").default } */
    this.scene = scene;

    /** @type { number } */
    this._type = Material.MATERIAL_DIFFUSE;

    /** @type { number } */
    this._glossiness = 0.6;
  }

  get type() {
    return this._type;
  }

  set type(type) {
    this._type = type;
    this.scene.flags |= FLAGS.MATERIAL_TYPE;
  }

  get glossiness() {
    return this._glossiness;
  }

  set glossiness(glossiness) {
    if (glossiness === this._glossiness) return;

    this._glossiness = glossiness;

    this.scene.flags |= FLAGS.MATERIAL_UPDATE;
  }
}
