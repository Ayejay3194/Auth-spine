export interface ClusterResult {
  clusters: number[];
  centroids: number[][];
  clusterSizes: number[];
  silhouetteScore: number;
  daviesBouldinIndex: number;
  inertia: number;
  quality: number;
  method: string;
  timestamp: Date;
}

export interface UserSegment {
  segmentId: string;
  name: string;
  size: number;
  characteristics: Record<string, any>;
  behaviors: string[];
  preferences: Record<string, any>;
  value: 'high' | 'medium' | 'low';
  churnRisk: number;
  ltv: number;
}

export interface ClusteringConfig {
  method: 'kmeans' | 'hierarchical' | 'dbscan' | 'ensemble';
  numClusters?: number;
  maxIterations?: number;
  convergenceThreshold?: number;
  useEnsemble?: boolean;
}

export class EnhancedClusteringEngine {
  private clusterCache: Map<string, ClusterResult> = new Map();
  private segmentProfiles: Map<string, UserSegment> = new Map();
  private domainKnowledge: Map<string, any> = new Map();

  constructor() {
    this.initializeDomainKnowledge();
  }

  private initializeDomainKnowledge(): void {
    // Domain-specific knowledge for clustering
    this.domainKnowledge.set('booking-behavior', {
      features: ['frequency', 'averageValue', 'recency', 'serviceType'],
      weights: [0.3, 0.3, 0.2, 0.2]
    });

    this.domainKnowledge.set('user-value', {
      features: ['totalSpent', 'bookingCount', 'averageRating', 'referrals'],
      weights: [0.4, 0.3, 0.2, 0.1]
    });

    this.domainKnowledge.set('churn-risk', {
      features: ['daysSinceLastBooking', 'bookingTrend', 'supportTickets', 'reviewSentiment'],
      weights: [0.35, 0.35, 0.2, 0.1]
    });
  }

  /**
   * Ensemble clustering combining multiple methods
   */
  async ensembleClustering(
    data: number[][],
    config?: Partial<ClusteringConfig>
  ): Promise<ClusterResult> {
    const clusterConfig: ClusteringConfig = {
      method: 'ensemble',
      numClusters: 5,
      maxIterations: 100,
      convergenceThreshold: 0.001,
      useEnsemble: true,
      ...config
    };

    const cacheKey = this.generateCacheKey(data, clusterConfig);
    const cached = this.clusterCache.get(cacheKey);
    if (cached) return cached;

    try {
      // Run multiple clustering methods
      const kmeansResult = await this.kMeansClustering(data, clusterConfig.numClusters || 5);
      const hierarchicalResult = await this.hierarchicalClustering(data, clusterConfig.numClusters || 5);
      const dbscanResult = await this.dbscanClustering(data);

      // Combine results using consensus
      const ensembleResult = this.combineClusteringResults(
        [kmeansResult, hierarchicalResult, dbscanResult],
        data
      );

      this.clusterCache.set(cacheKey, ensembleResult);
      return ensembleResult;
    } catch (error) {
      throw new Error(
        `Ensemble clustering failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * K-means clustering with domain-specific tuning
   */
  private async kMeansClustering(data: number[][], k: number): Promise<ClusterResult> {
    const maxIterations = 100;
    const convergenceThreshold = 0.001;

    // Initialize centroids using k-means++
    const centroids = this.initializeCentroidsKMeansPlusPlus(data, k);
    let clusters = Array(data.length).fill(0);
    let converged = false;
    let iteration = 0;

    while (!converged && iteration < maxIterations) {
      // Assign points to nearest centroid
      const newClusters = data.map(point =>
        this.findNearestCentroid(point, centroids)
      );

      // Check convergence
      converged = this.checkConvergence(clusters, newClusters, convergenceThreshold);
      clusters = newClusters;

      // Update centroids
      for (let i = 0; i < k; i++) {
        const clusterPoints = data.filter((_, idx) => clusters[idx] === i);
        if (clusterPoints.length > 0) {
          centroids[i] = this.calculateCentroid(clusterPoints);
        }
      }

      iteration++;
    }

    // Calculate quality metrics
    const silhouetteScore = this.calculateSilhouetteScore(data, clusters, centroids);
    const daviesBouldinIndex = this.calculateDaviesBouldinIndex(data, clusters, centroids);
    const inertia = this.calculateInertia(data, clusters, centroids);
    const quality = this.calculateClusteringQuality(silhouetteScore, daviesBouldinIndex);

    const clusterSizes = Array(k).fill(0);
    clusters.forEach(c => clusterSizes[c]++);

    return {
      clusters,
      centroids,
      clusterSizes,
      silhouetteScore,
      daviesBouldinIndex,
      inertia,
      quality,
      method: 'kmeans',
      timestamp: new Date()
    };
  }

  /**
   * Hierarchical clustering
   */
  private async hierarchicalClustering(data: number[][], k: number): Promise<ClusterResult> {
    // Build distance matrix
    const distanceMatrix = this.buildDistanceMatrix(data);

    // Agglomerative clustering
    let clusters: number[][] = data.map((_, i) => [i]);
    const clusterLabels = Array(data.length).fill(0).map((_, i) => i);

    while (clusters.length > k) {
      // Find closest pair of clusters
      let minDistance = Infinity;
      let mergeI = 0;
      let mergeJ = 1;

      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const distance = this.calculateClusterDistance(
            clusters[i],
            clusters[j],
            distanceMatrix
          );
          if (distance < minDistance) {
            minDistance = distance;
            mergeI = i;
            mergeJ = j;
          }
        }
      }

      // Merge clusters
      clusters[mergeI] = [...clusters[mergeI], ...clusters[mergeJ]];
      clusters.splice(mergeJ, 1);
    }

    // Convert to cluster assignments
    const finalClusters = Array(data.length).fill(0);
    clusters.forEach((cluster, idx) => {
      cluster.forEach(pointIdx => {
        finalClusters[pointIdx] = idx;
      });
    });

    // Calculate centroids
    const centroids = clusters.map(cluster =>
      this.calculateCentroid(cluster.map(i => data[i]))
    );

    const silhouetteScore = this.calculateSilhouetteScore(data, finalClusters, centroids);
    const daviesBouldinIndex = this.calculateDaviesBouldinIndex(data, finalClusters, centroids);
    const inertia = this.calculateInertia(data, finalClusters, centroids);
    const quality = this.calculateClusteringQuality(silhouetteScore, daviesBouldinIndex);

    const clusterSizes = Array(k).fill(0);
    finalClusters.forEach(c => clusterSizes[c]++);

    return {
      clusters: finalClusters,
      centroids,
      clusterSizes,
      silhouetteScore,
      daviesBouldinIndex,
      inertia,
      quality,
      method: 'hierarchical',
      timestamp: new Date()
    };
  }

  /**
   * DBSCAN clustering
   */
  private async dbscanClustering(data: number[][]): Promise<ClusterResult> {
    const eps = this.estimateEps(data);
    const minPts = Math.max(3, Math.floor(Math.log(data.length)));
    const clusters = Array(data.length).fill(-1);
    let clusterId = 0;

    for (let i = 0; i < data.length; i++) {
      if (clusters[i] !== -1) continue;

      const neighbors = this.findNeighbors(data, i, eps);
      if (neighbors.length < minPts) {
        clusters[i] = -1; // Noise point
        continue;
      }

      // Expand cluster
      clusters[i] = clusterId;
      const queue = [...neighbors];

      while (queue.length > 0) {
        const pointIdx = queue.shift()!;
        if (clusters[pointIdx] === -1) {
          clusters[pointIdx] = clusterId;
        }
        if (clusters[pointIdx] !== -1) continue;

        clusters[pointIdx] = clusterId;
        const pointNeighbors = this.findNeighbors(data, pointIdx, eps);
        if (pointNeighbors.length >= minPts) {
          queue.push(...pointNeighbors);
        }
      }

      clusterId++;
    }

    // Calculate centroids
    const numClusters = Math.max(...clusters) + 1;
    const centroids: number[][] = [];
    for (let i = 0; i < numClusters; i++) {
      const clusterPoints = data.filter((_, idx) => clusters[idx] === i);
      if (clusterPoints.length > 0) {
        centroids.push(this.calculateCentroid(clusterPoints));
      }
    }

    const silhouetteScore = this.calculateSilhouetteScore(data, clusters, centroids);
    const daviesBouldinIndex = this.calculateDaviesBouldinIndex(data, clusters, centroids);
    const inertia = this.calculateInertia(data, clusters, centroids);
    const quality = this.calculateClusteringQuality(silhouetteScore, daviesBouldinIndex);

    const clusterSizes = Array(numClusters).fill(0);
    clusters.forEach(c => {
      if (c !== -1) clusterSizes[c]++;
    });

    return {
      clusters,
      centroids,
      clusterSizes,
      silhouetteScore,
      daviesBouldinIndex,
      inertia,
      quality,
      method: 'dbscan',
      timestamp: new Date()
    };
  }

  /**
   * Segment users based on clustering
   */
  async segmentUsers(
    userData: Array<{
      id: string;
      features: Record<string, number>;
    }>,
    domain: string = 'user-value'
  ): Promise<UserSegment[]> {
    // Extract features
    const knowledge = this.domainKnowledge.get(domain);
    const featureMatrix = userData.map(user =>
      knowledge.features.map(f => user.features[f] || 0)
    );

    // Normalize features
    const normalized = this.normalizeFeatures(featureMatrix);

    // Cluster
    const clusterResult = await this.ensembleClustering(normalized, { numClusters: 5 });

    // Create segments
    const segments: UserSegment[] = [];
    for (let i = 0; i < clusterResult.clusterSizes.length; i++) {
      const clusterUsers = userData.filter((_, idx) => clusterResult.clusters[idx] === i);

      const segment: UserSegment = {
        segmentId: `segment_${domain}_${i}`,
        name: this.generateSegmentName(domain, i, clusterUsers),
        size: clusterUsers.length,
        characteristics: this.extractCharacteristics(clusterUsers),
        behaviors: this.identifyBehaviors(clusterUsers, domain),
        preferences: this.inferPreferences(clusterUsers),
        value: this.classifyValue(clusterUsers),
        churnRisk: this.calculateChurnRisk(clusterUsers),
        ltv: this.calculateLTV(clusterUsers)
      };

      segments.push(segment);
      this.segmentProfiles.set(segment.segmentId, segment);
    }

    return segments;
  }

  /**
   * Combine multiple clustering results
   */
  private combineClusteringResults(
    results: ClusterResult[],
    data: number[][]
  ): ClusterResult {
    // Use consensus clustering
    const consensusClusters = this.consensusClustering(
      results.map(r => r.clusters),
      data.length
    );

    // Calculate centroids
    const numClusters = Math.max(...consensusClusters) + 1;
    const centroids: number[][] = [];
    for (let i = 0; i < numClusters; i++) {
      const clusterPoints = data.filter((_, idx) => consensusClusters[idx] === i);
      if (clusterPoints.length > 0) {
        centroids.push(this.calculateCentroid(clusterPoints));
      }
    }

    const silhouetteScore = this.calculateSilhouetteScore(data, consensusClusters, centroids);
    const daviesBouldinIndex = this.calculateDaviesBouldinIndex(data, consensusClusters, centroids);
    const inertia = this.calculateInertia(data, consensusClusters, centroids);
    const quality = this.calculateClusteringQuality(silhouetteScore, daviesBouldinIndex);

    const clusterSizes = Array(numClusters).fill(0);
    consensusClusters.forEach(c => clusterSizes[c]++);

    return {
      clusters: consensusClusters,
      centroids,
      clusterSizes,
      silhouetteScore,
      daviesBouldinIndex,
      inertia,
      quality,
      method: 'ensemble',
      timestamp: new Date()
    };
  }

  /**
   * Consensus clustering from multiple results
   */
  private consensusClustering(clusterResults: number[][], n: number): number[] {
    const cooccurrenceMatrix = Array(n).fill(0).map(() => Array(n).fill(0));

    // Build co-occurrence matrix
    for (const clusters of clusterResults) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (clusters[i] === clusters[j]) {
            cooccurrenceMatrix[i][j]++;
            cooccurrenceMatrix[j][i]++;
          }
        }
      }
    }

    // Use co-occurrence as distance for clustering
    const consensusClusters = Array(n).fill(0);
    let clusterId = 0;

    for (let i = 0; i < n; i++) {
      if (consensusClusters[i] !== 0) continue;

      consensusClusters[i] = clusterId;
      for (let j = i + 1; j < n; j++) {
        if (cooccurrenceMatrix[i][j] > clusterResults.length / 2) {
          consensusClusters[j] = clusterId;
        }
      }

      clusterId++;
    }

    return consensusClusters;
  }

  /**
   * Initialize centroids using k-means++
   */
  private initializeCentroidsKMeansPlusPlus(data: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    centroids.push([...data[Math.floor(Math.random() * data.length)]]);

    for (let i = 1; i < k; i++) {
      const distances = data.map(point =>
        Math.min(...centroids.map(c => this.euclideanDistance(point, c)))
      );

      const totalDistance = distances.reduce((a, b) => a + b);
      let random = Math.random() * totalDistance;

      for (let j = 0; j < data.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push([...data[j]]);
          break;
        }
      }
    }

    return centroids;
  }

  /**
   * Find nearest centroid
   */
  private findNearestCentroid(point: number[], centroids: number[][]): number {
    let minDistance = Infinity;
    let nearestIdx = 0;

    for (let i = 0; i < centroids.length; i++) {
      const distance = this.euclideanDistance(point, centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIdx = i;
      }
    }

    return nearestIdx;
  }

  /**
   * Calculate centroid
   */
  private calculateCentroid(points: number[][]): number[] {
    if (points.length === 0) return [];

    const centroid = Array(points[0].length).fill(0);
    for (const point of points) {
      for (let i = 0; i < point.length; i++) {
        centroid[i] += point[i];
      }
    }

    return centroid.map(v => v / points.length);
  }

  /**
   * Euclidean distance
   */
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * Check convergence
   */
  private checkConvergence(prev: number[], current: number[], threshold: number): boolean {
    let changes = 0;
    for (let i = 0; i < prev.length; i++) {
      if (prev[i] !== current[i]) changes++;
    }
    return (changes / prev.length) < threshold;
  }

  /**
   * Build distance matrix
   */
  private buildDistanceMatrix(data: number[][]): number[][] {
    const n = data.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = this.euclideanDistance(data[i], data[j]);
        matrix[i][j] = distance;
        matrix[j][i] = distance;
      }
    }

    return matrix;
  }

  /**
   * Calculate cluster distance (linkage)
   */
  private calculateClusterDistance(
    cluster1: number[],
    cluster2: number[],
    distanceMatrix: number[][]
  ): number {
    // Average linkage
    let sum = 0;
    for (const i of cluster1) {
      for (const j of cluster2) {
        sum += distanceMatrix[i][j];
      }
    }
    return sum / (cluster1.length * cluster2.length);
  }

  /**
   * Calculate silhouette score
   */
  private calculateSilhouetteScore(data: number[][], clusters: number[], centroids: number[][]): number {
    let totalScore = 0;

    for (let i = 0; i < data.length; i++) {
      const cluster = clusters[i];
      const point = data[i];

      // Distance to own cluster centroid
      const a = this.euclideanDistance(point, centroids[cluster]);

      // Distance to nearest other cluster centroid
      let b = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        if (j !== cluster) {
          const distance = this.euclideanDistance(point, centroids[j]);
          b = Math.min(b, distance);
        }
      }

      const silhouette = (b - a) / Math.max(a, b);
      totalScore += silhouette;
    }

    return totalScore / data.length;
  }

  /**
   * Calculate Davies-Bouldin Index
   */
  private calculateDaviesBouldinIndex(data: number[][], clusters: number[], centroids: number[][]): number {
    const k = centroids.length;
    let sumRatio = 0;

    for (let i = 0; i < k; i++) {
      let maxRatio = 0;
      const clusterI = data.filter((_, idx) => clusters[idx] === i);

      if (clusterI.length === 0) continue;

      const avgDistI = clusterI.reduce((sum, point) =>
        sum + this.euclideanDistance(point, centroids[i]), 0) / clusterI.length;

      for (let j = 0; j < k; j++) {
        if (i === j) continue;

        const clusterJ = data.filter((_, idx) => clusters[idx] === j);
        if (clusterJ.length === 0) continue;

        const avgDistJ = clusterJ.reduce((sum, point) =>
          sum + this.euclideanDistance(point, centroids[j]), 0) / clusterJ.length;

        const centroidDist = this.euclideanDistance(centroids[i], centroids[j]);
        const ratio = (avgDistI + avgDistJ) / centroidDist;
        maxRatio = Math.max(maxRatio, ratio);
      }

      sumRatio += maxRatio;
    }

    return sumRatio / k;
  }

  /**
   * Calculate inertia
   */
  private calculateInertia(data: number[][], clusters: number[], centroids: number[][]): number {
    let inertia = 0;
    for (let i = 0; i < data.length; i++) {
      const cluster = clusters[i];
      inertia += Math.pow(this.euclideanDistance(data[i], centroids[cluster]), 2);
    }
    return inertia;
  }

  /**
   * Calculate clustering quality
   */
  private calculateClusteringQuality(silhouette: number, daviesBouldin: number): number {
    // Normalize scores (silhouette: -1 to 1, davies-bouldin: 0 to inf)
    const silhouetteNorm = (silhouette + 1) / 2; // Convert to 0-1
    const daviesBouldinNorm = Math.max(0, 1 - daviesBouldin / 3); // Convert to 0-1

    return (silhouetteNorm * 0.5 + daviesBouldinNorm * 0.5);
  }

  /**
   * Estimate eps for DBSCAN
   */
  private estimateEps(data: number[][]): number {
    const distances: number[] = [];

    for (let i = 0; i < Math.min(data.length, 100); i++) {
      for (let j = i + 1; j < Math.min(data.length, 100); j++) {
        distances.push(this.euclideanDistance(data[i], data[j]));
      }
    }

    distances.sort((a, b) => a - b);
    return distances[Math.floor(distances.length * 0.9)];
  }

  /**
   * Find neighbors for DBSCAN
   */
  private findNeighbors(data: number[][], pointIdx: number, eps: number): number[] {
    const neighbors: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (this.euclideanDistance(data[pointIdx], data[i]) <= eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  /**
   * Normalize features
   */
  private normalizeFeatures(data: number[][]): number[][] {
    const normalized = data.map(row => [...row]);
    const numFeatures = data[0].length;

    for (let j = 0; j < numFeatures; j++) {
      const values = data.map(row => row[j]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      for (let i = 0; i < data.length; i++) {
        normalized[i][j] = (data[i][j] - min) / range;
      }
    }

    return normalized;
  }

  /**
   * Generate segment name
   */
  private generateSegmentName(domain: string, index: number, users: any[]): string {
    const names: Record<string, string[]> = {
      'user-value': ['Premium', 'Standard', 'Emerging', 'At-Risk', 'Inactive'],
      'booking-behavior': ['Frequent', 'Regular', 'Occasional', 'Seasonal', 'Rare'],
      'churn-risk': ['Loyal', 'Engaged', 'Moderate', 'At-Risk', 'Critical']
    };

    return names[domain]?.[index] || `Segment ${index}`;
  }

  /**
   * Extract characteristics
   */
  private extractCharacteristics(users: any[]): Record<string, any> {
    return {
      avgBookings: users.reduce((sum, u) => sum + (u.features.frequency || 0), 0) / users.length,
      avgValue: users.reduce((sum, u) => sum + (u.features.averageValue || 0), 0) / users.length,
      retention: users.filter(u => (u.features.recency || 0) < 90).length / users.length
    };
  }

  /**
   * Identify behaviors
   */
  private identifyBehaviors(users: any[], domain: string): string[] {
    const behaviors: string[] = [];

    if (domain === 'booking-behavior') {
      const avgFreq = users.reduce((sum, u) => sum + (u.features.frequency || 0), 0) / users.length;
      if (avgFreq > 10) behaviors.push('High Frequency');
      if (avgFreq < 3) behaviors.push('Low Frequency');
    }

    return behaviors;
  }

  /**
   * Infer preferences
   */
  private inferPreferences(users: any[]): Record<string, any> {
    return {
      preferredServiceType: 'premium',
      communicationFrequency: 'weekly',
      paymentMethod: 'card'
    };
  }

  /**
   * Classify value
   */
  private classifyValue(users: any[]): 'high' | 'medium' | 'low' {
    const avgValue = users.reduce((sum, u) => sum + (u.features.totalSpent || 0), 0) / users.length;
    if (avgValue > 1000) return 'high';
    if (avgValue > 300) return 'medium';
    return 'low';
  }

  /**
   * Calculate churn risk
   */
  private calculateChurnRisk(users: any[]): number {
    const avgRecency = users.reduce((sum, u) => sum + (u.features.daysSinceLastBooking || 0), 0) / users.length;
    return Math.min(1, avgRecency / 365);
  }

  /**
   * Calculate LTV
   */
  private calculateLTV(users: any[]): number {
    return users.reduce((sum, u) => sum + (u.features.totalSpent || 0), 0) / users.length * 3;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(data: number[][], config: ClusteringConfig): string {
    const hash = JSON.stringify({ dataSize: data.length, config }).split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `cluster_${Math.abs(hash)}`;
  }

  /**
   * Get segment profile
   */
  getSegmentProfile(segmentId: string): UserSegment | undefined {
    return this.segmentProfiles.get(segmentId);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.clusterCache.clear();
  }
}

export default EnhancedClusteringEngine;
