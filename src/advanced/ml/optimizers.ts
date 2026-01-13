export namespace optimizers {
  export interface OptimizerState {
    m: number[]; // First moment (mean)
    v: number[]; // Second moment (variance)
    t: number; // Time step
  }

  export class AdamOptimizer {
    private state: OptimizerState;
    private learningRate: number;
    private beta1: number;
    private beta2: number;
    private epsilon: number;

    constructor(
      learningRate: number = 0.001,
      beta1: number = 0.9,
      beta2: number = 0.999,
      epsilon: number = 1e-8
    ) {
      this.learningRate = learningRate;
      this.beta1 = beta1;
      this.beta2 = beta2;
      this.epsilon = epsilon;
      this.state = { m: [], v: [], t: 0 };
    }

    step(gradients: number[]): number[] {
      if (this.state.m.length === 0) {
        this.state.m = new Array(gradients.length).fill(0);
        this.state.v = new Array(gradients.length).fill(0);
      }

      this.state.t++;

      const updates: number[] = [];

      for (let i = 0; i < gradients.length; i++) {
        // Update biased first moment estimate
        this.state.m[i] = this.beta1 * this.state.m[i] + (1 - this.beta1) * gradients[i];

        // Update biased second raw moment estimate
        this.state.v[i] = this.beta2 * this.state.v[i] + (1 - this.beta2) * gradients[i] * gradients[i];

        // Compute bias-corrected first moment estimate
        const m_hat = this.state.m[i] / (1 - Math.pow(this.beta1, this.state.t));

        // Compute bias-corrected second raw moment estimate
        const v_hat = this.state.v[i] / (1 - Math.pow(this.beta2, this.state.t));

        // Update parameters
        updates[i] = this.learningRate * m_hat / (Math.sqrt(v_hat) + this.epsilon);
      }

      return updates;
    }

    update(params: number[], gradients: number[]): number[] {
      const updates = this.step(gradients);
      return params.map((param, i) => param - updates[i]);
    }

    getState(): OptimizerState {
      return { ...this.state };
    }

    setState(state: OptimizerState): void {
      this.state = { ...state };
    }
  }

  export class RMSpropOptimizer {
    private state: Map<number, number> = new Map();
    private learningRate: number;
    private decay: number;
    private epsilon: number;
    private t: number = 0;

    constructor(learningRate: number = 0.01, decay: number = 0.99, epsilon: number = 1e-8) {
      this.learningRate = learningRate;
      this.decay = decay;
      this.epsilon = epsilon;
    }

    step(gradients: number[]): number[] {
      this.t++;
      const updates: number[] = [];

      for (let i = 0; i < gradients.length; i++) {
        const prevMeanSq = this.state.get(i) || 0;
        const meanSq = this.decay * prevMeanSq + (1 - this.decay) * gradients[i] * gradients[i];
        this.state.set(i, meanSq);

        updates[i] = this.learningRate * gradients[i] / (Math.sqrt(meanSq) + this.epsilon);
      }

      return updates;
    }
  }

  export class MomentumOptimizer {
    private velocity: number[] = [];
    private learningRate: number;
    private momentum: number;

    constructor(learningRate: number = 0.01, momentum: number = 0.9) {
      this.learningRate = learningRate;
      this.momentum = momentum;
    }

    step(gradients: number[]): number[] {
      if (this.velocity.length === 0) {
        this.velocity = new Array(gradients.length).fill(0);
      }

      const updates: number[] = [];

      for (let i = 0; i < gradients.length; i++) {
        this.velocity[i] = this.momentum * this.velocity[i] - this.learningRate * gradients[i];
        updates[i] = this.velocity[i];
      }

      return updates;
    }
  }

  export class AdaGradOptimizer {
    private accumulator: number[] = [];
    private learningRate: number;
    private epsilon: number;

    constructor(learningRate: number = 0.01, epsilon: number = 1e-8) {
      this.learningRate = learningRate;
      this.epsilon = epsilon;
    }

    step(gradients: number[]): number[] {
      if (this.accumulator.length === 0) {
        this.accumulator = new Array(gradients.length).fill(0);
      }

      const updates: number[] = [];

      for (let i = 0; i < gradients.length; i++) {
        this.accumulator[i] += gradients[i] * gradients[i];
        updates[i] = this.learningRate * gradients[i] / (Math.sqrt(this.accumulator[i]) + this.epsilon);
      }

      return updates;
    }
  }

  export class SGDOptimizer {
    private learningRate: number;

    constructor(learningRate: number = 0.01) {
      this.learningRate = learningRate;
    }

    step(gradients: number[]): number[] {
      return gradients.map(g => this.learningRate * g);
    }
  }
}
