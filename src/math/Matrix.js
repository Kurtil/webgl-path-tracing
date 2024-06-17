import Vector from "./Vector.js";

export default class Matrix {
  static create(elements) {
    const M = new Matrix();
    return M.setElements(elements);
  }

  // Identity matrix of size n
  static I(n) {
    const els = [];
    const k = n;
    let i, nj, j;
    do {
      i = k - n;
      els[i] = [];
      nj = k;
      do {
        j = k - nj;
        els[i][j] = i == j ? 1 : 0;
      } while (--nj);
    } while (--n);
    return Matrix.create(els);
  }

  static Translation(v) {
    if (v.elements.length == 2) {
      const r = Matrix.I(3);
      r.elements[2][0] = v.elements[0];
      r.elements[2][1] = v.elements[1];
      return r;
    }

    if (v.elements.length == 3) {
      const r = Matrix.I(4);
      r.elements[0][3] = v.elements[0];
      r.elements[1][3] = v.elements[1];
      r.elements[2][3] = v.elements[2];
      return r;
    }

    throw "Invalid length for Translation";
  }

  // Returns column k of the matrix as a vector
  col(j) {
    if (j > this.elements[0].length) {
      return null;
    }
    const col = [];
    let n = this.elements.length,
      k = n,
      i;
    do {
      i = k - n;
      col.push(this.elements[i][j - 1]);
    } while (--n);
    return Vector.create(col);
  }

  // Returns a copy of the matrix
  dup() {
    return Matrix.create(this.elements);
  }

  // Maps the matrix to another matrix (of the same dimensions) according to the given function
  map(fn) {
    let els = [],
      ni = this.elements.length,
      ki = ni,
      i,
      nj,
      kj = this.elements[0].length,
      j;
    do {
      i = ki - ni;
      nj = kj;
      els[i] = [];
      do {
        j = kj - nj;
        els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
      } while (--nj);
    } while (--ni);
    return Matrix.create(els);
  }

  // Returns true iff the argument has the same dimensions as the matrix
  isSameSizeAs(matrix) {
    const M = matrix.elements || matrix;
    if (typeof M[0][0] == "undefined") {
      M = Matrix.create(M).elements;
    }
    return (
      this.elements.length == M.length && this.elements[0].length == M[0].length
    );
  }

  // Returns the result of adding the argument to the matrix
  add(matrix) {
    const M = matrix.elements || matrix;
    if (typeof M[0][0] == "undefined") {
      M = Matrix.create(M).elements;
    }
    if (!this.isSameSizeAs(M)) {
      return null;
    }
    return this.map(function (x, i, j) {
      return x + M[i - 1][j - 1];
    });
  }

  // Returns the result of subtracting the argument from the matrix
  subtract(matrix) {
    const M = matrix.elements || matrix;
    if (typeof M[0][0] == "undefined") {
      M = Matrix.create(M).elements;
    }
    if (!this.isSameSizeAs(M)) {
      return null;
    }
    return this.map(function (x, i, j) {
      return x - M[i - 1][j - 1];
    });
  }

  // Returns true iff the matrix can multiply the argument from the left
  canMultiplyFromLeft(matrix) {
    const M = matrix.elements || matrix;
    if (typeof M[0][0] == "undefined") {
      M = Matrix.create(M).elements;
    }
    // this.columns should equal matrix.rows
    return this.elements[0].length == M.length;
  }

  // Returns the result of multiplying the matrix from the right by the argument.
  // If the argument is a scalar then just multiply all the elements. If the argument is
  // a vector, a vector is returned, which saves you having to remember calling
  // col(1) on the result.
  multiply(matrix) {
    if (!matrix.elements) {
      return this.map(function (x) {
        return x * matrix;
      });
    }
    const returnVector = matrix.modulus ? true : false;
    let M = matrix.elements || matrix;
    if (typeof M[0][0] == "undefined") {
      M = Matrix.create(M).elements;
    }
    if (!this.canMultiplyFromLeft(M)) {
      return null;
    }
    let ni = this.elements.length,
      ki = ni,
      i,
      nj,
      kj = M[0].length,
      j;
    let cols = this.elements[0].length,
      elements = [],
      sum,
      nc,
      c;
    do {
      i = ki - ni;
      elements[i] = [];
      nj = kj;
      do {
        j = kj - nj;
        sum = 0;
        nc = cols;
        do {
          c = cols - nc;
          sum += this.elements[i][c] * M[c][j];
        } while (--nc);
        elements[i][j] = sum;
      } while (--nj);
    } while (--ni);
    const newM = Matrix.create(elements);
    return returnVector ? newM.col(1) : newM;
  }

  x(matrix) {
    return this.multiply(matrix);
  }

  // Returns true iff the matrix is square
  isSquare() {
    return this.elements.length == this.elements[0].length;
  }

  // If the matrix is square, returns the diagonal elements as a vector.
  // Otherwise, returns null.
  diagonal() {
    if (!this.isSquare) {
      return null;
    }
    let els = [],
      n = this.elements.length,
      k = n,
      i;
    do {
      i = k - n;
      els.push(this.elements[i][i]);
    } while (--n);
    return Vector.create(els);
  }

  // Make the matrix upper (right) triangular by Gaussian elimination.
  // This method only adds multiples of rows to other rows. No rows are
  // scaled up or switched, and the determinant is preserved.
  toRightTriangular() {
    let M = this.dup(),
      els;
    let n = this.elements.length,
      k = n,
      i,
      np,
      kp = this.elements[0].length,
      p;
    do {
      i = k - n;
      if (M.elements[i][i] == 0) {
        for (j = i + 1; j < k; j++) {
          if (M.elements[j][i] != 0) {
            els = [];
            np = kp;
            do {
              p = kp - np;
              els.push(M.elements[i][p] + M.elements[j][p]);
            } while (--np);
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] != 0) {
        for (let j = i + 1; j < k; j++) {
          const multiplier = M.elements[j][i] / M.elements[i][i];
          els = [];
          np = kp;
          do {
            p = kp - np;
            // Elements with column numbers up to an including the number
            // of the row that we're subtracting can safely be set straight to
            // zero, since that's the point of this routine and it avoids having
            // to loop over and correct rounding errors later
            els.push(
              p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier
            );
          } while (--np);
          M.elements[j] = els;
        }
      }
    } while (--n);
    return M;
  }

  // Returns the determinant for square matrices
  determinant() {
    if (!this.isSquare()) {
      return null;
    }
    const M = this.toRightTriangular();
    let det = M.elements[0][0],
      n = M.elements.length - 1,
      k = n,
      i;
    do {
      i = k - n + 1;
      det = det * M.elements[i][i];
    } while (--n);
    return det;
  }

  // Returns true iff the matrix is singular
  isSingular() {
    return this.isSquare() && this.determinant() === 0;
  }

  // Returns the result of attaching the given argument to the right-hand side of the matrix
  augment(matrix) {
    let M = matrix.elements || matrix;
    if (typeof M[0][0] == "undefined") {
      M = Matrix.create(M).elements;
    }
    let T = this.dup(),
      cols = T.elements[0].length;
    let ni = T.elements.length,
      ki = ni,
      i,
      nj,
      kj = M[0].length,
      j;
    if (ni != M.length) {
      return null;
    }
    do {
      i = ki - ni;
      nj = kj;
      do {
        j = kj - nj;
        T.elements[i][cols + j] = M[i][j];
      } while (--nj);
    } while (--ni);
    return T;
  }

  // Returns the inverse (if one exists) using Gauss-Jordan
  inverse() {
    if (!this.isSquare() || this.isSingular()) {
      return null;
    }
    let ni = this.elements.length,
      ki = ni,
      i,
      j;
    let M = this.augment(Matrix.I(ni)).toRightTriangular();
    let np,
      kp = M.elements[0].length,
      p,
      els,
      divisor;
    let inverse_elements = [],
      new_element;
    // Matrix is non-singular so there will be no zeros on the diagonal
    // Cycle through rows from last to first
    do {
      i = ni - 1;
      // First, normalise diagonal elements to 1
      els = [];
      np = kp;
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      do {
        p = kp - np;
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle of the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= ki) {
          inverse_elements[i].push(new_element);
        }
      } while (--np);
      M.elements[i] = els;
      // Then, subtract this row from those above it to
      // give the identity matrix on the left hand side
      for (j = 0; j < i; j++) {
        els = [];
        np = kp;
        do {
          p = kp - np;
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        } while (--np);
        M.elements[j] = els;
      }
    } while (--ni);
    return Matrix.create(inverse_elements);
  }

  // Set the matrix's elements from an array. If the argument passed
  // is a vector, the resulting matrix will be a single column.
  setElements(els) {
    let i,
      elements = els.elements || els;
    if (typeof elements[0][0] != "undefined") {
      let ni = elements.length,
        ki = ni,
        nj,
        kj,
        j;
      this.elements = [];
      do {
        i = ki - ni;
        nj = elements[i].length;
        kj = nj;
        this.elements[i] = [];
        do {
          j = kj - nj;
          this.elements[i][j] = elements[i][j];
        } while (--nj);
      } while (--ni);
      return this;
    }
    let n = elements.length,
      k = n;
    this.elements = [];
    do {
      i = k - n;
      this.elements.push([elements[i]]);
    } while (--n);
    return this;
  }

  flatten() {
    const result = [];
    if (this.elements.length == 0) return [];

    for (let j = 0; j < this.elements[0].length; j++)
      for (let i = 0; i < this.elements.length; i++)
        result.push(this.elements[i][j]);
    return result;
  }
}
