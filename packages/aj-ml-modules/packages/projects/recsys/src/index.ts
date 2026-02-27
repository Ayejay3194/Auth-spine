import { MatrixFactorization } from "@aj/models";

export function demoRecsys() {
  const mf = new MatrixFactorization({ factors: 8, epochs: 30 });
  mf.fit([
    { userId:"u1", itemId:"i1", r:1 }, { userId:"u1", itemId:"i2", r:1 },
    { userId:"u2", itemId:"i2", r:1 }, { userId:"u2", itemId:"i3", r:1 },
    { userId:"u3", itemId:"i1", r:1 }, { userId:"u3", itemId:"i3", r:1 },
  ]);
  return mf.recommend("u1", ["i1","i2","i3","i4"], 3);
}
