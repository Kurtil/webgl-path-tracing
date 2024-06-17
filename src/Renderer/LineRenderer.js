import { makeProgram, setUniforms } from "./utils.js";

export default class LineRenderer {
  /**
   * @param { import("./Renderer.js").default } renderer
   */
  constructor(renderer) {
    /** @type { import("./Renderer.js").default } */
    this.renderer = renderer;

    const { gl } = renderer;

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const vertices = [
      0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1,
    ];
    const indices = [
      0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 2, 6, 3, 7,
    ];

    // create vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // create index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );

    // create line shader
    this.lineProgram = makeProgram(gl, lineVertexSource, lineFragmentSource);
    this.vertexAttribute = gl.getAttribLocation(this.lineProgram, "vertex");
    gl.enableVertexAttribArray(this.vertexAttribute);
    gl.vertexAttribPointer(this.vertexAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  render() {
    const { gl } = this.renderer;
    const { selectedObject } = this.renderer.viewer.scene;
    const { modelviewProjection } = this.renderer.viewer.scene.camera;

    gl.useProgram(this.lineProgram);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindVertexArray(this.vao);
    setUniforms(gl, this.lineProgram, {
      cubeMin: selectedObject.getMinCorner(),
      cubeMax: selectedObject.getMaxCorner(),
      modelviewProjection,
    });
    gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}

// vertex shader for drawing a line
const lineVertexSource =
  " in vec3 vertex;" +
  " uniform vec3 cubeMin;" +
  " uniform vec3 cubeMax;" +
  " uniform mat4 modelviewProjection;" +
  " void main() {" +
  "   gl_Position = modelviewProjection * vec4(mix(cubeMin, cubeMax, vertex), 1.0);" +
  " }";

// fragment shader for drawing a line
const lineFragmentSource =
  " precision highp float;" +
  " out vec4 color;" +
  " void main() {" +
  "   color = vec4(1.0);" +
  " }";
