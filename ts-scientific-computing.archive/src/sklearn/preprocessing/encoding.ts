export namespace preprocessing {
  export class LabelEncoder {
    private classes: string[] = [];
    private isFitted: boolean = false;

    fit(y: (string | number)[]): this {
      this.classes = [...new Set(y.map(v => String(v)))].sort();
      this.isFitted = true;
      return this;
    }

    transform(y: (string | number)[]): number[] {
      if (!this.isFitted) {
        throw new Error('LabelEncoder must be fitted before transform');
      }
      return y.map(v => this.classes.indexOf(String(v)));
    }

    fitTransform(y: (string | number)[]): number[] {
      return this.fit(y).transform(y);
    }

    inverseTransform(y: number[]): string[] {
      if (!this.isFitted) {
        throw new Error('LabelEncoder must be fitted before inverseTransform');
      }
      return y.map(v => this.classes[v]);
    }

    getClasses(): string[] {
      return this.classes;
    }
  }

  export class OneHotEncoder {
    private categories: string[][] = [];
    private isFitted: boolean = false;

    fit(X: (string | number)[][]): this {
      const n_features = X[0].length;
      this.categories = [];

      for (let j = 0; j < n_features; j++) {
        const unique = [...new Set(X.map(row => String(row[j])))].sort();
        this.categories.push(unique);
      }

      this.isFitted = true;
      return this;
    }

    transform(X: (string | number)[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('OneHotEncoder must be fitted before transform');
      }

      const result: number[][] = [];

      for (const row of X) {
        const encoded: number[] = [];

        for (let j = 0; j < row.length; j++) {
          const value = String(row[j]);
          const categoryIndex = this.categories[j].indexOf(value);

          for (let k = 0; k < this.categories[j].length; k++) {
            encoded.push(k === categoryIndex ? 1 : 0);
          }
        }

        result.push(encoded);
      }

      return result;
    }

    fitTransform(X: (string | number)[][]): number[][] {
      return this.fit(X).transform(X);
    }

    getFeatureNames(): string[] {
      const names: string[] = [];
      for (let j = 0; j < this.categories.length; j++) {
        for (const cat of this.categories[j]) {
          names.push(`x${j}_${cat}`);
        }
      }
      return names;
    }
  }

  export class OrdinalEncoder {
    private categories: string[][] = [];
    private isFitted: boolean = false;

    fit(X: (string | number)[][]): this {
      const n_features = X[0].length;
      this.categories = [];

      for (let j = 0; j < n_features; j++) {
        const unique = [...new Set(X.map(row => String(row[j])))].sort();
        this.categories.push(unique);
      }

      this.isFitted = true;
      return this;
    }

    transform(X: (string | number)[][]): number[][] {
      if (!this.isFitted) {
        throw new Error('OrdinalEncoder must be fitted before transform');
      }

      return X.map(row =>
        row.map((value, j) => this.categories[j].indexOf(String(value)))
      );
    }

    fitTransform(X: (string | number)[][]): number[][] {
      return this.fit(X).transform(X);
    }
  }

  export class BinaryEncoder {
    private categories: string[] = [];
    private isFitted: boolean = false;

    fit(y: (string | number)[]): this {
      this.categories = [...new Set(y.map(v => String(v)))].sort();
      if (this.categories.length !== 2) {
        throw new Error('BinaryEncoder requires exactly 2 classes');
      }
      this.isFitted = true;
      return this;
    }

    transform(y: (string | number)[]): number[] {
      if (!this.isFitted) {
        throw new Error('BinaryEncoder must be fitted before transform');
      }
      return y.map(v => (String(v) === this.categories[1] ? 1 : 0));
    }

    fitTransform(y: (string | number)[]): number[] {
      return this.fit(y).transform(y);
    }

    inverseTransform(y: number[]): string[] {
      if (!this.isFitted) {
        throw new Error('BinaryEncoder must be fitted before inverseTransform');
      }
      return y.map(v => this.categories[v]);
    }
  }

  export function polynomialFeatures(X: number[][], degree: number = 2): number[][] {
    const result: number[][] = [];

    for (const row of X) {
      const features: number[] = [...row];

      for (let d = 2; d <= degree; d++) {
        for (let i = 0; i < row.length; i++) {
          features.push(Math.pow(row[i], d));
        }

        for (let i = 0; i < row.length; i++) {
          for (let j = i + 1; j < row.length; j++) {
            features.push(row[i] * row[j]);
          }
        }
      }

      result.push(features);
    }

    return result;
  }

  export function getFeatureNames(n_features: number, degree: number = 2): string[] {
    const names: string[] = [];

    for (let i = 0; i < n_features; i++) {
      names.push(`x${i}`);
    }

    for (let d = 2; d <= degree; d++) {
      for (let i = 0; i < n_features; i++) {
        names.push(`x${i}^${d}`);
      }

      for (let i = 0; i < n_features; i++) {
        for (let j = i + 1; j < n_features; j++) {
          names.push(`x${i}*x${j}`);
        }
      }
    }

    return names;
  }
}
