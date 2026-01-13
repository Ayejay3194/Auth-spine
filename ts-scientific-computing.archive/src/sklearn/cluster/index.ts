export namespace cluster {
  export class KMeans {
    private nClusters: number;
    private maxIter: number;
    private centroids: number[][] = [];
    private labels: number[] = [];
    private isFitted: boolean = false;

    constructor(nClusters: number = 3, maxIter: number = 100) {
      this.nClusters = nClusters;
      this.maxIter = maxIter;
    }

    fit(X: number[][]): this {
      const n = X.length;
      const m = X[0].length;

      this.centroids = [];
      for (let i = 0; i < this.nClusters; i++) {
        const randomIdx = Math.floor(Math.random() * n);
        this.centroids.push([...X[randomIdx]]);
      }

      for (let iter = 0; iter < this.maxIter; iter++) {
        this.labels = new Array(n);
        for (let i = 0; i < n; i++) {
          let minDist = Infinity;
          let closestCluster = 0;

          for (let j = 0; j < this.nClusters; j++) {
            const dist = this.euclideanDistance(X[i], this.centroids[j]);
            if (dist < minDist) {
              minDist = dist;
              closestCluster = j;
            }
          }

          this.labels[i] = closestCluster;
        }

        const newCentroids: number[][] = [];
        for (let j = 0; j < this.nClusters; j++) {
          const clusterPoints = X.filter((_, i) => this.labels[i] === j);
          if (clusterPoints.length === 0) {
            newCentroids.push([...this.centroids[j]]);
            continue;
          }

          const newCentroid = new Array(m).fill(0);
          for (const point of clusterPoints) {
            for (let k = 0; k < m; k++) {
              newCentroid[k] += point[k];
            }
          }
          for (let k = 0; k < m; k++) {
            newCentroid[k] /= clusterPoints.length;
          }
          newCentroids.push(newCentroid);
        }

        let converged = true;
        for (let j = 0; j < this.nClusters; j++) {
          if (this.euclideanDistance(this.centroids[j], newCentroids[j]) > 1e-6) {
            converged = false;
            break;
          }
        }

        this.centroids = newCentroids;
        if (converged) break;
      }

      this.isFitted = true;
      return this;
    }

    predict(X: number[][]): number[] {
      if (!this.isFitted) {
        throw new Error('KMeans must be fitted before predict');
      }

      return X.map(point => {
        let minDist = Infinity;
        let closestCluster = 0;

        for (let j = 0; j < this.nClusters; j++) {
          const dist = this.euclideanDistance(point, this.centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            closestCluster = j;
          }
        }

        return closestCluster;
      });
    }

    getCentroids(): number[][] {
      return this.centroids;
    }

    getLabels(): number[] {
      return this.labels;
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }
  }

  export class DBSCAN {
    private eps: number;
    private minSamples: number;
    private labels: number[] = [];

    constructor(eps: number = 0.5, minSamples: number = 5) {
      this.eps = eps;
      this.minSamples = minSamples;
    }

    fit(X: number[][]): this {
      const n = X.length;
      this.labels = new Array(n).fill(-1);
      let clusterId = 0;

      for (let i = 0; i < n; i++) {
        if (this.labels[i] !== -1) continue;

        const neighbors = this.getNeighbors(X, i);
        if (neighbors.length < this.minSamples) {
          this.labels[i] = -1;
          continue;
        }

        this.expandCluster(X, i, neighbors, clusterId);
        clusterId++;
      }

      return this;
    }

    getLabels(): number[] {
      return this.labels;
    }

    private getNeighbors(X: number[][], pointIdx: number): number[] {
      const neighbors: number[] = [];
      for (let i = 0; i < X.length; i++) {
        if (this.euclideanDistance(X[pointIdx], X[i]) <= this.eps) {
          neighbors.push(i);
        }
      }
      return neighbors;
    }

    private expandCluster(X: number[][], pointIdx: number, neighbors: number[], clusterId: number): void {
      this.labels[pointIdx] = clusterId;
      const queue = [...neighbors];

      while (queue.length > 0) {
        const currentIdx = queue.shift()!;

        if (this.labels[currentIdx] === -1) {
          this.labels[currentIdx] = clusterId;
        }

        if (this.labels[currentIdx] !== -1) continue;

        this.labels[currentIdx] = clusterId;
        const currentNeighbors = this.getNeighbors(X, currentIdx);

        if (currentNeighbors.length >= this.minSamples) {
          queue.push(...currentNeighbors);
        }
      }
    }

    private euclideanDistance(a: number[], b: number[]): number {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
      }
      return Math.sqrt(sum);
    }
  }
}
