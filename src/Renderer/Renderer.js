import LineRenderer from "./LineRenderer.js";
import PathTracer from "./PathTracer.js";

export default class Renderer {
  /**
   * @param { import("../Viewer.js").default } viewer
   */
  constructor(viewer) {
    /** @type { import("../Viewer.js").default } */
    this.viewer = viewer;

    /** @type { HTMLCanvasElement } */
    this.canvas = viewer.canvas;

    /** @type { WebGL2RenderingContext } */
    this.gl = canvas.getContext("webgl2");

    if (!this.gl) return;

    this.lineRenderer = new LineRenderer(this);

    this.pathTracer = new PathTracer(this);
  }

  render(timeSinceStart) {

    this.pathTracer.render(timeSinceStart);

    if (this.viewer.scene.selectedObject) {
      this.lineRenderer.render();
    }
  }
}
