import Camera from "./Camera.js";
import Light from "./Light.js";
import Material from "./Material.js";

import Sphere from "./shapes/Sphere.js";
import Cube from "./shapes/Cube.js";
import Vector from "../math/Vector.js";

import FLAGS from "./flags.js";

import {
  makeCubeAndSpheres,
  makeSphereAndCube,
  makeSphereColumn,
  makeSpherePyramid,
  makeStacks,
  makeTableAndChair,
} from "./objectPatterns.js";

export default class Scene {
  static nextObjectId = 0;

  static ENVIRONMENTS = {
    YELLOW_BLUE_CORNELL_BOX: 0,
    RED_GREEN_CORNELL_BOX: 1,
  };

  /**
   * @param { import("../Viewer.js").default } viewer
   */
  constructor(viewer) {
    /** @type { import("../Viewer.js").default } */
    this.viewer = viewer;

    /** @type { Camera } */
    this.camera = new Camera(this);

    /** @type { Light } */
    this.light = new Light(this);

    this.objects = [];

    this.selectedObject = null;

    this.flags = 0b0011_1111; // all flags are set

    /** @type { Material } */
    this.material = new Material(this);

    /** @type { number }*/
    this._environment = Scene.ENVIRONMENTS.YELLOW_BLUE_CORNELL_BOX;
  }

  get environment() {
    return this._environment;
  }

  set environment(environment) {
    this._environment = environment;
    this.flags |= FLAGS.ENVIRONMENT;
  }

  /** @type { import("./Renderable.js").default[] } */
  get renderables() {
    return [this.light, ...this.objects];
  }

  /** @type { import("../Renderer/Renderer.js").default } */
  get renderer() {
    return this.viewer.renderer;
  }

  setObjects(objects) {
    this.objects = objects;
    this.selectedObject = null;
    this.flags |= FLAGS.OBJECTS_COUNT;
  }

  setTemplateCubeAndSpheres() {
    this.setObjects(makeCubeAndSpheres(this));
  }
  setTemplateSphereAndCube() {
    this.setObjects(makeSphereAndCube(this));
  }
  setTemplateSphereColumn() {
    this.setObjects(makeSphereColumn(this));
  }
  setTemplateSpherePyramid() {
    this.setObjects(makeSpherePyramid(this));
  }
  setTemplateStacks() {
    this.setObjects(makeStacks(this));
  }
  setTemplateTableAndChair() {
    this.setObjects(makeTableAndChair(this));
  }

  selectLight() {
    this.selectedObject = this.light;
  }

  addSphere() {
    this.objects.push(
      new Sphere(this, Vector.create([0, 0, 0]), 0.25, Scene.nextObjectId++)
    );
    this.selectedObject = null;
  }

  addCube() {
    this.objects.push(
      new Cube(
        this,
        Vector.create([-0.25, -0.25, -0.25]),
        Vector.create([0.25, 0.25, 0.25]),
        Scene.nextObjectId++
      )
    );
    this.selectedObject = null;
  }

  deleteSelection() {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.selectedObject == this.objects[i]) {
        this.objects.splice(i, 1);
        this.selectedObject = null;
        this.flags |= FLAGS.OBJECTS_COUNT;
        break;
      }
    }
  }
}
