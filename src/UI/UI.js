import Material from "../Scene/Material.js";
import Vector from "../math/Vector.js";
import Cube from "../Scene/shapes/Cube.js";

export default class UI {
  /**
   * @param { import("../Viewer.js").default } viewer
   */
  constructor(viewer) {
    /**
     * @type { import("../Viewer.js").default  }
     */
    this.viewer = viewer;

    this.moving = false;

    this.error = document.getElementById("error");
    this.error.innerHTML = "Loading...";
    this.error.style.zIndex = -1;

    let mouseDown = false,
      oldX,
      oldY;

    document.onmousedown = (event) => {
      const mouse = canvasMousePos(event);
      oldX = mouse.x;
      oldY = mouse.y;

      if (mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
        mouseDown = !this.mouseDown(mouse.x, mouse.y);

        // disable selection because dragging is used for rotating the camera and moving objects
        return false;
      }

      return true;
    };

    document.onmousemove = (event) => {
      const mouse = canvasMousePos(event);

      if (mouseDown) {
        // update the angles based on how far we moved since last time
        this.viewer.scene.camera.angleY -= (mouse.x - oldX) * 0.01;
        this.viewer.scene.camera.angleX += (mouse.y - oldY) * 0.01;

        // don't go upside down
        this.viewer.scene.camera.angleX = Math.max(
          this.viewer.scene.camera.angleX,
          -Math.PI / 2 + 0.01
        );
        this.viewer.scene.camera.angleX = Math.min(
          this.viewer.scene.camera.angleX,
          Math.PI / 2 - 0.01
        );

        // remember this coordinate
        oldX = mouse.x;
        oldY = mouse.y;
      } else {
        this.mouseMove(mouse.x, mouse.y);
      }
    };

    document.onmouseup = (event) => {
      mouseDown = false;

      const mouse = canvasMousePos(event);
      this.mouseUp(mouse.x, mouse.y);
    };

    document.onkeydown = (event) => {
      // if there are no <input> elements focused
      if (
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA"
      ) {
        // if backspace or delete was pressed
        if (event.keyCode == 8 || event.keyCode == 46) {
          this.viewer.scene.deleteSelection();

          // don't let the backspace key go back a page
          return false;
        }
      }
    };

    document
      .getElementById("selectLight")
      .addEventListener("click", () => this.viewer.scene.selectLight());
    document
      .getElementById("addSphere")
      .addEventListener("click", () => this.viewer.scene.addSphere());
    document
      .getElementById("addCube")
      .addEventListener("click", () => this.viewer.scene.addCube());

    document
      .getElementById("sphereColumn")
      .addEventListener("click", () =>
        this.viewer.scene.setTemplateSphereColumn()
      );
    document
      .getElementById("spherePyramid")
      .addEventListener("click", () =>
        this.viewer.scene.setTemplateSpherePyramid()
      );
    document
      .getElementById("sphereAndCube")
      .addEventListener("click", () =>
        this.viewer.scene.setTemplateSphereAndCube()
      );
    document
      .getElementById("cubeAndSpheres")
      .addEventListener("click", () =>
        this.viewer.scene.setTemplateCubeAndSpheres()
      );
    document
      .getElementById("tableAndChair")
      .addEventListener("click", () =>
        this.viewer.scene.setTemplateTableAndChair()
      );
    document
      .getElementById("stacks")
      .addEventListener("click", () =>
        this.viewer.scene.setTemplateStacks()
      );
  }

  /**
   * @returns { import("../Scene/Scene.js").default }
   */
  get scene() {
    return this.viewer.scene;
  }

  update() {
    document.getElementById("glossiness-factor").style.display =
      this.scene.material.type == Material.MATERIAL_GLOSSY
        ? "inline"
        : "none";

    this.updateMaterial();
    this.updateGlossiness();
    this.updateEnvironment();
  }

  mouseDown(x, y) {
    const { eye } = this.viewer.scene.camera;
    let t;
    const origin = eye;
    const ray = this.viewer.scene.camera.getEyeRay(
      this.viewer.scene.camera.modelviewProjection.inverse(),
      (x / 512) * 2 - 1,
      1 - (y / 512) * 2
    );

    // test the selection box first
    if (this.viewer.scene.selectedObject != null) {
      const minBounds = this.viewer.scene.selectedObject.getMinCorner();
      const maxBounds = this.viewer.scene.selectedObject.getMaxCorner();
      t = Cube.intersect(origin, ray, minBounds, maxBounds);

      if (t < Number.MAX_VALUE) {
        const hit = origin.add(ray.multiply(t));

        if (Math.abs(hit.elements[0] - minBounds.elements[0]) < 0.001)
          this.movementNormal = Vector.create([-1, 0, 0]);
        else if (Math.abs(hit.elements[0] - maxBounds.elements[0]) < 0.001)
          this.movementNormal = Vector.create([+1, 0, 0]);
        else if (Math.abs(hit.elements[1] - minBounds.elements[1]) < 0.001)
          this.movementNormal = Vector.create([0, -1, 0]);
        else if (Math.abs(hit.elements[1] - maxBounds.elements[1]) < 0.001)
          this.movementNormal = Vector.create([0, +1, 0]);
        else if (Math.abs(hit.elements[2] - minBounds.elements[2]) < 0.001)
          this.movementNormal = Vector.create([0, 0, -1]);
        else this.movementNormal = Vector.create([0, 0, +1]);

        this.movementDistance = this.movementNormal.dot(hit);
        this.originalHit = hit;
        this.moving = true;

        return true;
      }
    }

    t = Number.MAX_VALUE;
    this.viewer.scene.selectedObject = null;

    const { renderables } = this.viewer.scene;

    for (let i = 0; i < renderables.length; i++) {
      const objectT = renderables[i].intersect(origin, ray);
      if (objectT < t) {
        t = objectT;
        this.viewer.scene.selectedObject = renderables[i];
      }
    }

    return t < Number.MAX_VALUE;
  }

  mouseMove(x, y) {
    if (this.moving) {
      const { eye: origin } = this.viewer.scene.camera;
      const ray = this.viewer.scene.camera.getEyeRay(
        this.viewer.scene.camera.modelviewProjection.inverse(),
        (x / 512) * 2 - 1,
        1 - (y / 512) * 2
      );

      const t =
        (this.movementDistance - this.movementNormal.dot(origin)) /
        this.movementNormal.dot(ray);
      const hit = origin.add(ray.multiply(t));
      this.viewer.scene.selectedObject.temporaryTranslate(
        hit.subtract(this.originalHit)
      );
    }
  }

  mouseUp(x, y) {
    if (this.moving) {
      const { eye: origin } = this.viewer.scene.camera;
      const ray = this.viewer.scene.camera.getEyeRay(
        this.viewer.scene.camera.modelviewProjection.inverse(),
        (x / 512) * 2 - 1,
        1 - (y / 512) * 2
      );

      const t =
        (this.movementDistance - this.movementNormal.dot(origin)) /
        this.movementNormal.dot(ray);
      const hit = origin.add(ray.multiply(t));
      this.viewer.scene.selectedObject.temporaryTranslate(
        Vector.create([0, 0, 0])
      );
      this.viewer.scene.selectedObject.translate(
        hit.subtract(this.originalHit)
      );
      this.moving = false;
    }
  }

  updateMaterial() {
    const newMaterial = parseInt(document.getElementById("material").value, 10);
    if (this.scene.material.type != newMaterial) {
      this.scene.material.type = newMaterial;
    }
  }

  updateEnvironment() {
    const newEnvironment = parseInt(
      document.getElementById("environment").value,
      10
    );
    if (this.scene.environment != newEnvironment) {
      this.scene.environment = newEnvironment;
    }
  }

  updateGlossiness() {
    let newGlossiness = parseFloat(document.getElementById("glossiness").value);
    if (isNaN(newGlossiness)) newGlossiness = 0;
    newGlossiness = Math.max(0, Math.min(1, newGlossiness));

    this.scene.material.glossiness = newGlossiness;
  }
}

function elementPos(element) {
  let x = 0,
    y = 0;
  while (element.offsetParent) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}

function eventPos(event) {
  return {
    x:
      event.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft,
    y:
      event.clientY +
      document.body.scrollTop +
      document.documentElement.scrollTop,
  };
}

function canvasMousePos(event) {
  const mousePos = eventPos(event);
  const canvasPos = elementPos(canvas);
  return {
    x: mousePos.x - canvasPos.x,
    y: mousePos.y - canvasPos.y,
  };
}
