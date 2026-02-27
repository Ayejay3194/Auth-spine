import type { Model } from "../models/model.js";

export interface ArtifactBundle {
  createdAt: string;
  model: { name: string; payload: Record<string, unknown> };
  extras?: Record<string, unknown>;
}

export function packModelArtifact(model: Model<any>, payload: Record<string, unknown>, extras?: Record<string, unknown>): ArtifactBundle {
  return {
    createdAt: new Date().toISOString(),
    model: { name: model.name, payload },
    extras,
  };
}

/** Basic integrity hash so you can detect accidental changes in storage. */
export function artifactHash(artifact: ArtifactBundle): string {
  const json = JSON.stringify(artifact);
  let h = 2166136261;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
