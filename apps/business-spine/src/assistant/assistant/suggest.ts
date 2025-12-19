import { Suggestion } from "./types";
import { stableId } from "./utils";

export const makeSuggestion = (s: Omit<Suggestion,"id"|"createdAt"> & { createdAt?: Date }): Suggestion => {
  const createdAt = s.createdAt ?? new Date();
  return { id: stableId(s.engine, s.title, createdAt.toISOString()), createdAt, ...s };
};
