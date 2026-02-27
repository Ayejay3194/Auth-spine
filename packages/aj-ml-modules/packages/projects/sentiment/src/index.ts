import { trainSentiment, predictSentiment } from "@aj/nlp";

export function demoSentiment() {
  const texts = ["love this haircut", "hate this service", "amazing stylist", "terrible appointment"];
  const labels = [1,0,1,0];
  const m = trainSentiment(texts, labels);
  return predictSentiment(m, ["love the results", "this was awful"]);
}
