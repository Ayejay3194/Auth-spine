export interface OptimizeResult {
  x: number[];
  fun: number;
  nit: number;
  success: boolean;
}

function numericalGradient(func: (x: number[]) => number, x: number[], eps: number = 1e-5): number[] {
  const gradient: number[] = [];
  const f0 = func(x);

  for (let i = 0; i < x.length; i++) {
    const xPlus = [...x];
    xPlus[i] += eps;
    const fPlus = func(xPlus);
    gradient.push((fPlus - f0) / eps);
  }

  return gradient;
}

export function minimize(
  func: (x: number[]) => number,
  x0: number[],
  method: string = 'BFGS',
  maxiter: number = 100
): OptimizeResult {
  let x = [...x0];
  const learningRate = 0.01;
  let bestFun = func(x);

  for (let iter = 0; iter < maxiter; iter++) {
    const gradient = numericalGradient(func, x);
    const newX = x.map((val, i) => val - learningRate * gradient[i]);
    const newFun = func(newX);

    if (newFun < bestFun) {
      bestFun = newFun;
      x = newX;
    } else {
      break;
    }
  }

  return {
    x,
    fun: bestFun,
    nit: maxiter,
    success: true
  };
}
