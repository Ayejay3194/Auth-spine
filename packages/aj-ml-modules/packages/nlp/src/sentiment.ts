/**
 * Sentiment Analysis System (Intermediate)
 * Baseline:
 * - TF-IDF vectorization
 * - Logistic regression classifier
 */
import { fitTfIdf, transformTfIdf, TfIdfModel } from "./tfidf";
import { LogisticRegression } from "@aj/models";

export interface SentimentModel {
  tfidf: TfIdfModel;
  clf: LogisticRegression;
}

export function trainSentiment(texts: string[], labels: number[]): SentimentModel {
  const tfidf = fitTfIdf(texts, 8000);
  const X = transformTfIdf(tfidf, texts);
  const clf = new LogisticRegression({ lr: 0.2, epochs: 400 });
  clf.fit(X, labels);
  return { tfidf, clf };
}

export function predictSentiment(m: SentimentModel, texts: string[]): number[] {
  const X = transformTfIdf(m.tfidf, texts);
  return m.clf.predict(X);
}
