import Scene from "./Scene.js";

import Cube from "./shapes/Cube.js";
import Sphere from "./shapes/Sphere.js";

import Vector from "../math/Vector.js";

/**
 * @param { Scene } scene
 * @returns { Cube[] }
 */
export function makeStacks(scene) {
  const objects = [];

  // lower level
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.5, -0.75, -0.5]),
      Vector.create([0.5, -0.7, 0.5]),
      Scene.nextObjectId++
    )
  );

  // further poles
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.45, -1, -0.45]),
      Vector.create([-0.4, -0.45, -0.4]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.4, -1, -0.45]),
      Vector.create([0.45, -0.45, -0.4]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.45, -1, 0.4]),
      Vector.create([-0.4, -0.45, 0.45]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.4, -1, 0.4]),
      Vector.create([0.45, -0.45, 0.45]),
      Scene.nextObjectId++
    )
  );

  // upper level
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.3, -0.5, -0.3]),
      Vector.create([0.3, -0.45, 0.3]),
      Scene.nextObjectId++
    )
  );

  // closer poles
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.25, -0.7, -0.25]),
      Vector.create([-0.2, -0.25, -0.2]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.2, -0.7, -0.25]),
      Vector.create([0.25, -0.25, -0.2]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.25, -0.7, 0.2]),
      Vector.create([-0.2, -0.25, 0.25]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.2, -0.7, 0.2]),
      Vector.create([0.25, -0.25, 0.25]),
      Scene.nextObjectId++
    )
  );

  // upper level
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.25, -0.25, -0.25]),
      Vector.create([0.25, -0.2, 0.25]),
      Scene.nextObjectId++
    )
  );

  return objects;
}

/**
 * @param { Scene } scene
 * @returns { import("../Scene/Renderable.js")[] }
 */
export function makeTableAndChair(scene) {
  const objects = [];

  // table top
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.5, -0.35, -0.5]),
      Vector.create([0.3, -0.3, 0.5]),
      Scene.nextObjectId++
    )
  );

  // table legs
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.45, -1, -0.45]),
      Vector.create([-0.4, -0.35, -0.4]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.2, -1, -0.45]),
      Vector.create([0.25, -0.35, -0.4]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.45, -1, 0.4]),
      Vector.create([-0.4, -0.35, 0.45]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.2, -1, 0.4]),
      Vector.create([0.25, -0.35, 0.45]),
      Scene.nextObjectId++
    )
  );

  // chair seat
  objects.push(
    new Cube(
      scene,
      Vector.create([0.3, -0.6, -0.2]),
      Vector.create([0.7, -0.55, 0.2]),
      Scene.nextObjectId++
    )
  );

  // chair legs
  objects.push(
    new Cube(
      scene,
      Vector.create([0.3, -1, -0.2]),
      Vector.create([0.35, -0.6, -0.15]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.3, -1, 0.15]),
      Vector.create([0.35, -0.6, 0.2]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.65, -1, -0.2]),
      Vector.create([0.7, 0.1, -0.15]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.65, -1, 0.15]),
      Vector.create([0.7, 0.1, 0.2]),
      Scene.nextObjectId++
    )
  );

  // chair back
  objects.push(
    new Cube(
      scene,
      Vector.create([0.65, 0.05, -0.15]),
      Vector.create([0.7, 0.1, 0.15]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.65, -0.55, -0.09]),
      Vector.create([0.7, 0.1, -0.03]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Cube(
      scene,
      Vector.create([0.65, -0.55, 0.03]),
      Vector.create([0.7, 0.1, 0.09]),
      Scene.nextObjectId++
    )
  );

  // sphere on table
  objects.push(
    new Sphere(
      scene,
      Vector.create([-0.1, -0.05, 0]),
      0.25,
      Scene.nextObjectId++
    )
  );

  return objects;
}

/**
 * @param { Scene } scene
 * @returns { import("../Scene/Renderable.js")[] }
 */
export function makeSphereAndCube(scene) {
  const objects = [];
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.25, -1, -0.25]),
      Vector.create([0.25, -0.75, 0.25]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(scene, Vector.create([0, -0.75, 0]), 0.25, Scene.nextObjectId++)
  );
  return objects;
}

/**
 * @param { Scene } scene
 * @returns { Sphere[] }
 */
export function makeSphereColumn(scene) {
  const objects = [];
  objects.push(
    new Sphere(scene, Vector.create([0, 0.75, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, 0.25, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, -0.25, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, -0.75, 0]), 0.25, Scene.nextObjectId++)
  );
  return objects;
}

/**
 * @param { Scene } scene
 * @returns { import("../Scene/Renderable.js")[] }
 */
export function makeCubeAndSpheres(scene) {
  const objects = [];
  objects.push(
    new Cube(
      scene,
      Vector.create([-0.25, -0.25, -0.25]),
      Vector.create([0.25, 0.25, 0.25]),
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(scene, Vector.create([-0.25, 0, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([+0.25, 0, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, -0.25, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, +0.25, 0]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, 0, -0.25]), 0.25, Scene.nextObjectId++)
  );
  objects.push(
    new Sphere(scene, Vector.create([0, 0, +0.25]), 0.25, Scene.nextObjectId++)
  );
  return objects;
}

/**
 * @param { Scene } scene
 * @returns { Sphere[] }
 */
export function makeSpherePyramid(scene) {
  const root3_over4 = 0.433012701892219;
  const root3_over6 = 0.288675134594813;
  const root6_over6 = 0.408248290463863;
  const objects = [];

  // first level
  objects.push(
    new Sphere(
      scene,
      Vector.create([-0.5, -0.75, -root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.0, -0.75, -root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.5, -0.75, -root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([-0.25, -0.75, root3_over4 - root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.25, -0.75, root3_over4 - root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.0, -0.75, 2.0 * root3_over4 - root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );

  // second level
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.0, -0.75 + root6_over6, root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([-0.25, -0.75 + root6_over6, -0.5 * root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.25, -0.75 + root6_over6, -0.5 * root3_over6]),
      0.25,
      Scene.nextObjectId++
    )
  );

  // third level
  objects.push(
    new Sphere(
      scene,
      Vector.create([0.0, -0.75 + 2.0 * root6_over6, 0.0]),
      0.25,
      Scene.nextObjectId++
    )
  );

  return objects;
}
