/**
 * Reinforcement Learning Game AI (Advanced)
 * Minimal gridworld + Q-learning.
 */
export type Action = 0|1|2|3; // up, right, down, left

export interface GridWorld {
  w: number;
  h: number;
  terminal: (s: number) => boolean;
  reward: (s: number, a: Action, sp: number) => number;
  step: (s: number, a: Action) => number;
}

export function makeSimpleWorld(w=5,h=5, goal=[4,4]): GridWorld {
  const goalS = goal[1]*w + goal[0];
  const step = (s:number,a:Action)=>{
    const x=s%w, y=Math.floor(s/w);
    const nx = a===1?x+1 : a===3?x-1 : x;
    const ny = a===2?y+1 : a===0?y-1 : y;
    const cx = Math.max(0, Math.min(w-1, nx));
    const cy = Math.max(0, Math.min(h-1, ny));
    return cy*w + cx;
  };
  return {
    w,h,
    terminal: (s)=> s===goalS,
    step,
    reward: (_s,_a,sp)=> sp===goalS ? 1 : -0.01
  };
}

export function qLearn(world: GridWorld, episodes=2000, alpha=0.2, gamma=0.98, eps=0.2, seed=42) {
  const S = world.w*world.h, A = 4;
  const Q = Array.from({length:S}, ()=>Array(A).fill(0));
  let s = seed>>>0;
  const rnd = ()=> (s=(1664525*s+1013904223)>>>0)/2**32;
  const argmax = (arr:number[])=> arr.reduce((bi,_,i)=> arr[i]! > arr[bi]! ? i : bi, 0);

  for (let ep=0; ep<episodes; ep++){
    let st = 0;
    for (let t=0; t<200; t++){
      if (world.terminal(st)) break;
      const a: Action = (rnd()<eps ? (Math.floor(rnd()*A) as any) : (argmax(Q[st]!) as any));
      const sp = world.step(st,a);
      const r = world.reward(st,a,sp);
      const best = Q[sp]![argmax(Q[sp]!) ]!;
      Q[st]![a] = (1-alpha)*Q[st]![a]! + alpha*(r + gamma*best);
      st = sp;
    }
  }
  return Q;
}
