export namespace metrics {
  export function rocCurve(yTrue: number[], yScore: number[]): {
    fpr: number[];
    tpr: number[];
    thresholds: number[];
  } {
    const thresholds = [...new Set(yScore)].sort((a, b) => b - a);
    const fpr: number[] = [];
    const tpr: number[] = [];

    const positives = yTrue.filter(y => y === 1).length;
    const negatives = yTrue.filter(y => y === 0).length;

    for (const threshold of thresholds) {
      const predictions = yScore.map(score => (score >= threshold ? 1 : 0));

      const tp = predictions.filter((pred, i) => pred === 1 && yTrue[i] === 1).length;
      const fp = predictions.filter((pred, i) => pred === 1 && yTrue[i] === 0).length;

      fpr.push(fp / negatives);
      tpr.push(tp / positives);
    }

    return { fpr, tpr, thresholds };
  }

  export function aucScore(yTrue: number[], yScore: number[]): number {
    const { fpr, tpr } = rocCurve(yTrue, yScore);

    let auc = 0;
    for (let i = 1; i < fpr.length; i++) {
      auc += (fpr[i] - fpr[i - 1]) * (tpr[i] + tpr[i - 1]) / 2;
    }

    return Math.abs(auc);
  }

  export function precisionRecallCurve(yTrue: number[], yScore: number[]): {
    precision: number[];
    recall: number[];
    thresholds: number[];
  } {
    const thresholds = [...new Set(yScore)].sort((a, b) => b - a);
    const precision: number[] = [];
    const recall: number[] = [];

    const positives = yTrue.filter(y => y === 1).length;

    for (const threshold of thresholds) {
      const predictions = yScore.map(score => (score >= threshold ? 1 : 0));

      const tp = predictions.filter((pred, i) => pred === 1 && yTrue[i] === 1).length;
      const fp = predictions.filter((pred, i) => pred === 1 && yTrue[i] === 0).length;

      precision.push(tp / (tp + fp || 1));
      recall.push(tp / positives);
    }

    return { precision, recall, thresholds };
  }

  export function hammingLoss(yTrue: number[], yPred: number[]): number {
    const mismatches = yTrue.filter((val, i) => val !== yPred[i]).length;
    return mismatches / yTrue.length;
  }

  export function jaccardScore(yTrue: number[], yPred: number[]): number {
    let intersection = 0;
    let union = 0;

    for (let i = 0; i < yTrue.length; i++) {
      if (yTrue[i] === 1 || yPred[i] === 1) {
        union++;
        if (yTrue[i] === 1 && yPred[i] === 1) {
          intersection++;
        }
      }
    }

    return intersection / union;
  }

  export function logLoss(yTrue: number[], yProba: number[][]): number {
    let loss = 0;

    for (let i = 0; i < yTrue.length; i++) {
      const label = yTrue[i];
      const prob = yProba[i][label];
      loss -= Math.log(Math.max(prob, 1e-15));
    }

    return loss / yTrue.length;
  }

  export function balancedAccuracy(yTrue: number[], yPred: number[]): number {
    const classes = [...new Set(yTrue)];
    let totalRecall = 0;

    for (const cls of classes) {
      const classIndices = yTrue.map((val, i) => (val === cls ? i : -1)).filter(i => i !== -1);
      const correct = classIndices.filter(i => yPred[i] === cls).length;
      totalRecall += correct / classIndices.length;
    }

    return totalRecall / classes.length;
  }

  export function cohenKappa(yTrue: number[], yPred: number[]): number {
    const n = yTrue.length;
    const po = yTrue.filter((val, i) => val === yPred[i]).length / n;

    const classes = [...new Set([...yTrue, ...yPred])];
    let pe = 0;

    for (const cls of classes) {
      const p_true = yTrue.filter(val => val === cls).length / n;
      const p_pred = yPred.filter(val => val === cls).length / n;
      pe += p_true * p_pred;
    }

    return (po - pe) / (1 - pe);
  }

  export function matthews(yTrue: number[], yPred: number[]): number {
    const tp = yTrue.filter((val, i) => val === 1 && yPred[i] === 1).length;
    const tn = yTrue.filter((val, i) => val === 0 && yPred[i] === 0).length;
    const fp = yTrue.filter((val, i) => val === 0 && yPred[i] === 1).length;
    const fn = yTrue.filter((val, i) => val === 1 && yPred[i] === 0).length;

    const numerator = tp * tn - fp * fn;
    const denominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  export function fowlkesMallows(yTrue: number[], yPred: number[]): number {
    const tp = yTrue.filter((val, i) => val === 1 && yPred[i] === 1).length;
    const fp = yTrue.filter((val, i) => val === 0 && yPred[i] === 1).length;
    const fn = yTrue.filter((val, i) => val === 1 && yPred[i] === 0).length;

    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);

    return Math.sqrt(precision * recall);
  }
}
