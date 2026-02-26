import { Tensor, TensorFactory } from "./tensor";

export type Activation = "tanh" | "relu" | "linear";

export function act(x: Tensor, kind: Activation): Tensor {
  switch (kind) {
    case "tanh": return x.map(Math.tanh);
    case "relu": return x.map(v => (v > 0 ? v : 0));
    case "linear": return x.clone();
  }
}

export function dAct(z: Tensor, kind: Activation): Tensor {
  switch (kind) {
    case "tanh": {
      const t = z.map(Math.tanh);
      return t.map(v => 1 - v * v);
    }
    case "relu": return z.map(v => (v > 0 ? 1 : 0));
    case "linear": return z.map(_ => 1);
  }
}

export type Loss = "mse";

export function lossAndGrad(yHat: Tensor, y: Tensor, kind: Loss): { loss: number; grad: Tensor } {
  // MSE: L = 0.5 * ||yHat - y||^2
  const diff = yHat.clone().sub_(y);
  const l = 0.5 * diff.dot(diff);
  return { loss: l, grad: diff }; // dL/dyHat = yHat - y
}

export interface Layer {
  W: Tensor; // [out, in]
  b: Tensor; // [out, 1]
  activation: Activation;
}

export interface ForwardCache {
  a: Tensor[]; // activations, a[0]=x
  z: Tensor[]; // pre-activations, z[l]=W a[l] + b (l aligns with layer index)
}

export class MLP {
  public layers: Layer[];

  constructor(layers: Layer[]) {
    this.layers = layers;
  }

  forward(x: Tensor): { yHat: Tensor; cache: ForwardCache } {
    const a: Tensor[] = [x.clone()];
    const z: Tensor[] = [];
    for (let l = 0; l < this.layers.length; l++) {
      const L = this.layers[l];
      const zl = L.W.matmul(a[l]).add_(L.b);
      z.push(zl);
      const al = act(zl, L.activation);
      a.push(al);
    }
    return { yHat: a[a.length - 1], cache: { a, z } };
  }
}

export function initMLP(factory: TensorFactory, sizes: number[], activations: Activation[], seed = 1): MLP {
  const layers: Layer[] = [];
  for (let i = 1; i < sizes.length; i++) {
    const out = sizes[i], inn = sizes[i - 1];
    layers.push({
      W: factory.randn([out, inn], seed + i),
      b: factory.zeros([out, 1]),
      activation: activations[i - 1],
    });
  }
  return new MLP(layers);
}
