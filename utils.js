function getEyeRay(matrix, x, y) {
    return matrix.multiply(Vector.create([x, y, 0, 1])).divideByW().ensure3().subtract(eye);
  }
  
  function setUniforms(program, uniforms) {
    for (var name in uniforms) {
      var value = uniforms[name];
      var location = gl.getUniformLocation(program, name);
      if (location == null) continue;
      if (value instanceof Vector) {
        gl.uniform3fv(location, new Float32Array([value.elements[0], value.elements[1], value.elements[2]]));
      } else if (value instanceof Matrix) {
        gl.uniformMatrix4fv(location, false, new Float32Array(value.flatten()));
      } else {
        gl.uniform1f(location, value);
      }
    }
  }
  
  function concat(objects, func) {
    var text = '';
    for (var i = 0; i < objects.length; i++) {
      text += func(objects[i]);
    }
    return text;
  }
  
  function compileSource(source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw 'compile error: ' + gl.getShaderInfoLog(shader);
    }
    return shader;
  }
  
  function compileShader(vertexSource, fragmentSource) {
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, compileSource(vertexSource, gl.VERTEX_SHADER));
    gl.attachShader(shaderProgram, compileSource(fragmentSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw 'link error: ' + gl.getProgramInfoLog(shaderProgram);
    }
    return shaderProgram;
  }