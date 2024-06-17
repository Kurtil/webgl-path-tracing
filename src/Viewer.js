import Renderer from "./Renderer/Renderer.js";
import Scene from "./Scene/Scene.js";
import UI from "./UI/UI.js";

export default class Viewer {
  /**
   * @param { HTMLCanvasElement } canvas
   */
  constructor(canvas = document.getElementById("canvas")) {
    /** @type { HTMLCanvasElement } */
    this.canvas = canvas;

    /** @type { Renderer } */
    this.renderer = new Renderer(this);

    /** @type { Scene } */
    this.scene = new Scene(this);
    this.scene.setTemplateSphereColumn();

    /** @type { UI } */
    this.ui = new UI(this);

    if (!this.renderer.gl) {
      this.ui.error.innerHTML =
        'Your browser does not support WebGL.<br>Please see <a href="http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">Getting a WebGL Implementation</a>.';
      return;
    }

    const start = new Date();

    const run = () => {
      this.tick((new Date() - start) * 0.001);
      requestAnimationFrame(run);
    };

    run();
  }

  tick(timeSinceStart) {
    this.ui.update();

    this.renderer.render(timeSinceStart);
  }
}
