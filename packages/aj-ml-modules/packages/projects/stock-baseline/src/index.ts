/**
 * Stock Price Predictor (Intermediate)
 * Honest baseline: moving average + drift.
 * Swap later with TFJS LSTM if you want.
 */
export function movingAverageForecast(series: number[], window=10, horizon=5) {
  const out: number[] = [];
  let s = series.slice();
  for (let h=0; h<horizon; h++){
    const tail = s.slice(-window);
    const m = tail.reduce((a,b)=>a+b,0) / (tail.length || 1);
    out.push(m);
    s.push(m);
  }
  return out;
}
