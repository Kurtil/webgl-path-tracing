export default class Vector {
  static min(a, b) {
    if (a.length != b.length) {
      return null;
    }
    const newElements = [];
    for (let i = 0; i < a.elements.length; i++) {
      newElements.push(Math.min(a.elements[i], b.elements[i]));
    }
    return Vector.create(newElements);
  };

  static max(a, b) {
    if (a.length != b.length) {
      return null;
    }
    const newElements = [];
    for (let i = 0; i < a.elements.length; i++) {
      newElements.push(Math.max(a.elements[i], b.elements[i]));
    }
    return Vector.create(newElements);
  };

  static create(elements) {
    const V = new Vector();
    return V.setElements(elements);
  };


  // Returns element i of the vector
  e(i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
  }

  // Returns the modulus ('length') of the vector
  modulus() {
    return Math.sqrt(this.dot(this));
  }

  // Returns a copy of the vector
  dup() {
    return Vector.create(this.elements);
  }

  // Maps the vector to another vector according to the given function
  map(fn) {
    const elements = [];
    this.each(function (x, i) {
      elements.push(fn(x, i));
    });
    return Vector.create(elements);
  }

  // Calls the iterator for each element of the vector in turn
  each(fn) {
    let n = this.elements.length, k = n, i;
    do {
      i = k - n;
      fn(this.elements[i], i + 1);
    } while (--n);
  }

  // Returns a new vector created by normalizing the receiver
  toUnitVector() {
    const r = this.modulus();
    if (r === 0) { return this.dup(); }
    return this.map(function (x) { return x / r; });
  }

  // Returns the result of adding the argument to the vector
  add(vector) {
    const V = vector.elements || vector;
    if (this.elements.length != V.length) { return null; }
    return this.map(function (x, i) { return x + V[i - 1]; });
  }

  // Returns the result of subtracting the argument from the vector
  subtract(vector) {
    const V = vector.elements || vector;
    if (this.elements.length != V.length) { return null; }
    return this.map(function (x, i) { return x - V[i - 1]; });
  }

  // Returns the result of multiplying the elements of the vector by the argument
  multiply(k) {
    return this.map(function (x) { return x * k; });
  }

  // Returns the scalar product of the vector with the argument
  // Both vectors must have equal dimensionality
  dot(vector) {
    const V = vector.elements || vector;
    let product = 0, n = this.elements.length;
    if (n != V.length) { return null; }
    do { product += this.elements[n - 1] * V[n - 1]; } while (--n);
    return product;
  }

  // Returns the vector product of the vector with the argument
  // Both vectors must have dimensionality 3
  cross(vector) {
    const B = vector.elements || vector;
    if (this.elements.length != 3 || B.length != 3) { return null; }
    const A = this.elements;
    return Vector.create([
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
  }

  // Set vector's elements from an array
  setElements(els) {
    this.elements = (els.elements || els).slice();
    return this;
  }

  minComponent() {
    let value = Number.MAX_VALUE;
    for (let i = 0; i < this.elements.length; i++) {
      value = Math.min(value, this.elements[i]);
    }
    return value;
  };

  maxComponent() {
    let value = -Number.MAX_VALUE;
    for (let i = 0; i < this.elements.length; i++) {
      value = Math.max(value, this.elements[i]);
    }
    return value;
  };

  ensure3() {
    return Vector.create([this.elements[0], this.elements[1], this.elements[2]]);
  };

  divideByW() {
    const w = this.elements[this.elements.length - 1];
    const newElements = [];
    for (let i = 0; i < this.elements.length; i++) {
      newElements.push(this.elements[i] / w);
    }
    return Vector.create(newElements);
  };

  componentDivide(vector) {
    if (this.elements.length != vector.elements.length) {
      return null;
    }
    const newElements = [];
    for (let i = 0; i < this.elements.length; i++) {
      newElements.push(this.elements[i] / vector.elements[i]);
    }
    return Vector.create(newElements);
  };
};
