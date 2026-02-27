import { LinearRegressionGD } from "@aj/models";
import { mse, r2 } from "@aj/core";

export function demoLinearRegression() {
  // y = 3x + noise
  const X = Array.from({length:200}, (_,i)=>[i/10]);
  const y = X.map(r => 3*(r[0]??0) + (Math.random()*0.5-0.25));
  const m = new LinearRegressionGD({ lr: 0.05, epochs: 800 });
  m.fit(X, y);
  const pred = m.predict(X);
  return { mse: mse(y, pred), r2: r2(y, pred), params: m.params() };
}
