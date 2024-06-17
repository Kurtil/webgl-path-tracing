import { makeProgram, setUniforms } from "./utils.js";
import Light from "../Scene/Light.js";

import Vector from "../math/Vector.js";
import Matrix from "../math/Matrix.js";

import flags from "../Scene/flags.js";

const needRebuild =
  flags.OBJECTS_COUNT | flags.ENVIRONMENT | flags.MATERIAL_TYPE;
const resetSampleCount =
  flags.OBJECTS_POSITION | flags.MATERIAL_UPDATE | flags.CAMERA;

export default class PathTracer {
  /**
   * @param { import("./Renderer.js").default } renderer
   */
  constructor(renderer) {
    this.renderer = renderer;

    /** @type { { gl: WebGL2RenderingContext} } */
    const { gl } = renderer;

    const vertices = [-1, -1, -1, +1, +1, -1, +1, +1];

    // create vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // create framebuffer
    this.framebuffer = gl.createFramebuffer();

    // create textures
    const renderingToFloatTexture = gl.getExtension("EXT_color_buffer_float");
    this.textures = [];
    for (let i = 0; i < 2; i++) {
      this.textures.push(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texStorage2D(
        gl.TEXTURE_2D,
        1,
        renderingToFloatTexture ? gl.RGBA32F : gl.RGB8,
        512,
        512
      );
    }
    gl.bindTexture(gl.TEXTURE_2D, null);

    // create render shader
    this.renderProgram = makeProgram(
      gl,
      renderVertexSource,
      renderFragmentSource
    );
    this.renderVertexAttribute = gl.getAttribLocation(
      this.renderProgram,
      "vertex"
    );
    gl.enableVertexAttribArray(this.renderVertexAttribute);

    this.sampleCount = 0;
    this.tracerProgram = null;
  }

  /** @type { import("../Viewer.js").default } */
  get viewer() {
    return this.renderer.viewer;
  }

  buildTracerProgram() {
    const { gl } = this.renderer;

    this.uniforms = {};
    this.sampleCount = 0;

    // create tracer shader
    if (this.tracerProgram != null) {
      gl.deleteProgram(this.tracerProgram);
    }
    this.tracerProgram = makeProgram(
      this.viewer.renderer.gl,
      tracerVertexSource,
      makeTracerFragmentSource(
        this.viewer.scene.renderables,
        this.viewer.scene.material.type,
        this.viewer.scene.environment
      )
    );
    this.tracerVertexAttribute = gl.getAttribLocation(
      this.tracerProgram,
      "vertex"
    );
    gl.enableVertexAttribArray(this.tracerVertexAttribute);
  }

  render(timeSinceStart) {
    if (this.tracerProgram === null || this.viewer.scene.flags & needRebuild) {
      this.buildTracerProgram();
    }

    if (this.viewer.scene.flags & resetSampleCount) {
      this.sampleCount = 0;
    }

    this.viewer.scene.flags = 0; // clear flags

    // calculate uniforms
    for (const renderable of this.viewer.scene.renderables) {
      renderable.setUniforms(this);
    }

    const { camera } = this.viewer.scene;

    const jitter = Matrix.Translation(
      Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]).multiply(
        1 / 512
      )
    );
    const matrix = jitter.multiply(camera.modelviewProjection).inverse();

    this.uniforms.eye = camera.eye;
    this.uniforms.glossiness = this.viewer.scene.material.glossiness;
    this.uniforms.ray00 = camera.getEyeRay(matrix, -1, -1);
    this.uniforms.ray01 = camera.getEyeRay(matrix, -1, +1);
    this.uniforms.ray10 = camera.getEyeRay(matrix, +1, -1);
    this.uniforms.ray11 = camera.getEyeRay(matrix, +1, +1);
    this.uniforms.timeSinceStart = timeSinceStart;
    this.uniforms.textureWeight = this.sampleCount / (this.sampleCount + 1);

    const { gl } = this.renderer;
    // set uniforms
    gl.useProgram(this.tracerProgram);
    setUniforms(gl, this.tracerProgram, this.uniforms);

    // render to texture
    gl.useProgram(this.tracerProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.textures[1],
      0
    );
    gl.vertexAttribPointer(
      this.tracerVertexAttribute,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // ping pong textures
    this.textures.reverse();
    this.sampleCount++;

    gl.useProgram(this.renderProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(
      this.renderVertexAttribute,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

////////////////////////////////////////////////////////////////////////////////
// shader strings
////////////////////////////////////////////////////////////////////////////////

// vertex shader for drawing a textured quad
const renderVertexSource =
  " in vec3 vertex;" +
  " out vec2 uv;" +
  " void main() {" +
  "   uv = vertex.xy * 0.5 + 0.5;" +
  "   gl_Position = vec4(vertex, 1.0);" +
  " }";

// fragment shader for drawing a textured quad
const renderFragmentSource =
  " precision highp float;" +
  " in vec2 uv;" +
  " out vec4 color;" +
  " uniform sampler2D tex;" +
  " void main() {" +
  "   color = texture(tex, uv);" +
  " }";

// constants for the shaders
const bounces = "5";
const epsilon = "0.0001";
const infinity = "10000.0";
const lightVal = 0.5;

// vertex shader, interpolate ray per-pixel
const tracerVertexSource =
  " in vec3 vertex;" +
  " uniform vec3 ray00, ray01, ray10, ray11;" +
  " out vec3 initialRay;" +
  " void main() {" +
  "   vec2 percent = vertex.xy * 0.5 + 0.5;" +
  "   initialRay = mix(mix(ray00, ray01, percent.y), mix(ray10, ray11, percent.y), percent.x);" +
  "   gl_Position = vec4(vertex, 1.0);" +
  " }";

// start of fragment shader
const tracerFragmentSourceHeader =
  " precision highp float;" +
  " uniform vec3 eye;" +
  " in vec3 initialRay;" +
  " uniform float textureWeight;" +
  " uniform float timeSinceStart;" +
  " uniform sampler2D tex;" +
  " uniform float glossiness;" +
  " vec3 roomCubeMin = vec3(-1.0, -1.0, -1.0);" +
  " vec3 roomCubeMax = vec3(1.0, 1.0, 1.0);";

// compute the near and far intersections of the cube (stored in the x and y components) using the slab method
// no intersection means vec.x > vec.y (really tNear > tFar)
const intersectCubeSource =
  " vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {" +
  "   vec3 tMin = (cubeMin - origin) / ray;" +
  "   vec3 tMax = (cubeMax - origin) / ray;" +
  "   vec3 t1 = min(tMin, tMax);" +
  "   vec3 t2 = max(tMin, tMax);" +
  "   float tNear = max(max(t1.x, t1.y), t1.z);" +
  "   float tFar = min(min(t2.x, t2.y), t2.z);" +
  "   return vec2(tNear, tFar);" +
  " }";

// given that hit is a point on the cube, what is the surface normal?
// TODO: do this with fewer branches
const normalForCubeSource =
  " vec3 normalForCube(vec3 hit, vec3 cubeMin, vec3 cubeMax)" +
  " {" +
  "   if(hit.x < cubeMin.x + " +
  epsilon +
  ") return vec3(-1.0, 0.0, 0.0);" +
  "   else if(hit.x > cubeMax.x - " +
  epsilon +
  ") return vec3(1.0, 0.0, 0.0);" +
  "   else if(hit.y < cubeMin.y + " +
  epsilon +
  ") return vec3(0.0, -1.0, 0.0);" +
  "   else if(hit.y > cubeMax.y - " +
  epsilon +
  ") return vec3(0.0, 1.0, 0.0);" +
  "   else if(hit.z < cubeMin.z + " +
  epsilon +
  ") return vec3(0.0, 0.0, -1.0);" +
  "   else return vec3(0.0, 0.0, 1.0);" +
  " }";

// compute the near intersection of a sphere
// no intersection returns a value of +infinity
const intersectSphereSource =
  " float intersectSphere(vec3 origin, vec3 ray, vec3 sphereCenter, float sphereRadius) {" +
  "   vec3 toSphere = origin - sphereCenter;" +
  "   float a = dot(ray, ray);" +
  "   float b = 2.0 * dot(toSphere, ray);" +
  "   float c = dot(toSphere, toSphere) - sphereRadius*sphereRadius;" +
  "   float discriminant = b*b - 4.0*a*c;" +
  "   if(discriminant > 0.0) {" +
  "     float t = (-b - sqrt(discriminant)) / (2.0 * a);" +
  "     if(t > 0.0) return t;" +
  "   }" +
  "   return " +
  infinity +
  ";" +
  " }";

// given that hit is a point on the sphere, what is the surface normal?
const normalForSphereSource =
  " vec3 normalForSphere(vec3 hit, vec3 sphereCenter, float sphereRadius) {" +
  "   return (hit - sphereCenter) / sphereRadius;" +
  " }";

// use the fragment position for randomness
const randomSource =
  " float random(vec3 scale, float seed) {" +
  "   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);" +
  " }";

// random cosine-weighted distributed vector
// from http://www.rorydriscoll.com/2009/01/07/better-sampling/
const cosineWeightedDirectionSource =
  " vec3 cosineWeightedDirection(float seed, vec3 normal) {" +
  "   float u = random(vec3(12.9898, 78.233, 151.7182), seed);" +
  "   float v = random(vec3(63.7264, 10.873, 623.6736), seed);" +
  "   float r = sqrt(u);" +
  "   float angle = 6.283185307179586 * v;" +
  // compute basis from normal
  "   vec3 sdir, tdir;" +
  "   if (abs(normal.x)<.5) {" +
  "     sdir = cross(normal, vec3(1,0,0));" +
  "   } else {" +
  "     sdir = cross(normal, vec3(0,1,0));" +
  "   }" +
  "   tdir = cross(normal, sdir);" +
  "   return r*cos(angle)*sdir + r*sin(angle)*tdir + sqrt(1.-u)*normal;" +
  " }";

// random normalized vector
const uniformlyRandomDirectionSource =
  " vec3 uniformlyRandomDirection(float seed) {" +
  "   float u = random(vec3(12.9898, 78.233, 151.7182), seed);" +
  "   float v = random(vec3(63.7264, 10.873, 623.6736), seed);" +
  "   float z = 1.0 - 2.0 * u;" +
  "   float r = sqrt(1.0 - z * z);" +
  "   float angle = 6.283185307179586 * v;" +
  "   return vec3(r * cos(angle), r * sin(angle), z);" +
  " }";

// random vector in the unit sphere
// note: this is probably not statistically uniform, saw raising to 1/3 power somewhere but that looks wrong?
const uniformlyRandomVectorSource =
  " vec3 uniformlyRandomVector(float seed) {" +
  "   return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));" +
  " }";

// compute specular lighting contribution
const specularReflection =
  " vec3 reflectedLight = normalize(reflect(light - hit, normal));" +
  " specularHighlight = max(0.0, dot(reflectedLight, normalize(hit - origin)));";

// update ray using normal and bounce according to a diffuse reflection
const newDiffuseRay =
  " ray = cosineWeightedDirection(timeSinceStart + float(bounce), normal);";

// update ray using normal according to a specular reflection
const newReflectiveRay =
  " ray = reflect(ray, normal);" +
  specularReflection +
  " specularHighlight = 2.0 * pow(specularHighlight, 20.0);";

// update ray using normal and bounce according to a glossy reflection
const newGlossyRay =
  " ray = normalize(reflect(ray, normal)) + uniformlyRandomVector(timeSinceStart + float(bounce)) * glossiness;" +
  specularReflection +
  " specularHighlight = pow(specularHighlight, 3.0);";

const yellowBlueCornellBox =
  " if(hit.x < -0.9999) surfaceColor = vec3(0.1, 0.5, 1.0);" + // blue
  " else if(hit.x > 0.9999) surfaceColor = vec3(1.0, 0.9, 0.1);"; // yellow

const redGreenCornellBox =
  " if(hit.x < -0.9999) surfaceColor = vec3(1.0, 0.3, 0.1);" + // red
  " else if(hit.x > 0.9999) surfaceColor = vec3(0.3, 1.0, 0.1);"; // green

function makeShadow(objects) {
  return (
    "" +
    " float shadow(vec3 origin, vec3 ray) {" +
    concat(objects, function (o) {
      return o.getShadowTestCode();
    }) +
    "   return 1.0;" +
    " }"
  );
}

function makeCalculateColor(objects, materialType, environment) {
  return (
    "" +
    " vec3 calculateColor(vec3 origin, vec3 ray, vec3 light) {" +
    "   vec3 colorMask = vec3(1.0);" +
    "   vec3 accumulatedColor = vec3(0.0);" +
    // main raytracing loop
    "   for(int bounce = 0; bounce < " +
    bounces +
    "; bounce++) {" +
    // compute the intersection with everything
    "     vec2 tRoom = intersectCube(origin, ray, roomCubeMin, roomCubeMax);" +
    concat(objects, function (o) {
      return o.getIntersectCode();
    }) +
    // find the closest intersection
    "     float t = " +
    infinity +
    ";" +
    "     if(tRoom.x < tRoom.y) t = tRoom.y;" +
    concat(objects, function (o) {
      return o.getMinimumIntersectCode();
    }) +
    // info about hit
    "     vec3 hit = origin + ray * t;" +
    "     vec3 surfaceColor = vec3(0.75);" +
    "     float specularHighlight = 0.0;" +
    "     vec3 normal;" +
    // calculate the normal (and change wall color)
    "     if(t == tRoom.y) {" +
    "       normal = -normalForCube(hit, roomCubeMin, roomCubeMax);" +
    [yellowBlueCornellBox, redGreenCornellBox][environment] +
    newDiffuseRay +
    "     } else if(t == " +
    infinity +
    ") {" +
    "       break;" +
    "     } else {" +
    "       if(false) ;" + // hack to discard the first 'else' in 'else if'
    concat(objects, function (o) {
      return o.getNormalCalculationCode();
    }) +
    [newDiffuseRay, newReflectiveRay, newGlossyRay][materialType] +
    "     }" +
    // compute diffuse lighting contribution
    "     vec3 toLight = light - hit;" +
    "     float diffuse = max(0.0, dot(normalize(toLight), normal));" +
    // trace a shadow ray to the light
    "     float shadowIntensity = shadow(hit + normal * " +
    epsilon +
    ", toLight);" +
    // do light bounce
    "     colorMask *= surfaceColor;" +
    "     accumulatedColor += colorMask * (" +
    lightVal +
    " * diffuse * shadowIntensity);" +
    "     accumulatedColor += colorMask * specularHighlight * shadowIntensity;" +
    // calculate next origin
    "     origin = hit;" +
    "   }" +
    "   return accumulatedColor;" +
    " }"
  );
}

function makeMain() {
  return (
    "" +
    "out vec4 color;" +
    " void main() {" +
    "   vec3 newLight = light + uniformlyRandomVector(timeSinceStart - 53.0) * " +
    Light.SIZE +
    ";" +
    "   vec3 t = texture(tex, gl_FragCoord.xy / 512.0).rgb;" +
    "   color = vec4(mix(calculateColor(eye, initialRay, newLight), t, textureWeight), 1.0);" +
    " }"
  );
}

function makeTracerFragmentSource(objects, materialType, environment) {
  return (
    tracerFragmentSourceHeader +
    concat(objects, function (o) {
      return o.getGlobalCode();
    }) +
    intersectCubeSource +
    normalForCubeSource +
    intersectSphereSource +
    normalForSphereSource +
    randomSource +
    cosineWeightedDirectionSource +
    uniformlyRandomDirectionSource +
    uniformlyRandomVectorSource +
    makeShadow(objects) +
    makeCalculateColor(objects, materialType, environment) +
    makeMain()
  );
}

function concat(objects, func) {
  let text = "";
  for (let i = 0; i < objects.length; i++) {
    text += func(objects[i]);
  }
  return text;
}
