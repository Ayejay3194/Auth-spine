export { metrics as advancedMetrics } from './advanced';

export namespace metrics {
  export function accuracyScore(yTrue: number[], yPred: number[]): number {
    const correct = yTrue.filter((val, i) => val === yPred[i]).length;
    return correct / yTrue.length;
  }

  export function precisionScore(yTrue: number[], yPred: number[], average: string = 'binary'): number {
    if (average === 'binary') {
      const truePositives = yTrue.filter((val, i) => val === 1 && yPred[i] === 1).length;
      const falsePositives = yTrue.filter((val, i) => val === 0 && yPred[i] === 1).length;
      return truePositives / (truePositives + falsePositives || 1);
    }
    return 0;
  }

  export function recallScore(yTrue: number[], yPred: number[], average: string = 'binary'): number {
    if (average === 'binary') {
      const truePositives = yTrue.filter((val, i) => val === 1 && yPred[i] === 1).length;
      const falseNegatives = yTrue.filter((val, i) => val === 1 && yPred[i] === 0).length;
      return truePositives / (truePositives + falseNegatives || 1);
    }
    return 0;
  }

  export function f1Score(yTrue: number[], yPred: number[], average: string = 'binary'): number {
    const precision = precisionScore(yTrue, yPred, average);
    const recall = recallScore(yTrue, yPred, average);
    return (2 * precision * recall) / (precision + recall || 1);
  }

  export function confusionMatrix(yTrue: number[], yPred: number[]): number[][] {
    const matrix: number[][] = [
      [0, 0],
      [0, 0]
    ];

    for (let i = 0; i < yTrue.length; i++) {
      if (yTrue[i] === 0 && yPred[i] === 0) matrix[0][0]++;
      else if (yTrue[i] === 0 && yPred[i] === 1) matrix[0][1]++;
      else if (yTrue[i] === 1 && yPred[i] === 0) matrix[1][0]++;
      else if (yTrue[i] === 1 && yPred[i] === 1) matrix[1][1]++;
    }

    return matrix;
  }

  export function meanSquaredError(yTrue: number[], yPred: number[]): number {
    const sumSquaredErrors = yTrue.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
    return sumSquaredErrors / yTrue.length;
  }

  export function meanAbsoluteError(yTrue: number[], yPred: number[]): number {
    const sumAbsoluteErrors = yTrue.reduce((sum, val, i) => sum + Math.abs(val - yPred[i]), 0);
    return sumAbsoluteErrors / yTrue.length;
  }

  export function rSquaredScore(yTrue: number[], yPred: number[]): number {
    const yMean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
    const ssRes = yTrue.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
    const ssTot = yTrue.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    return 1 - ssRes / ssTot;
  }
}
