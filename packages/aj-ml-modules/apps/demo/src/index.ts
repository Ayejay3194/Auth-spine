import { trainIris } from "@aj/project-iris";
import { demoLinearRegression } from "@aj/project-linear-regression";
import { demoSentiment } from "@aj/project-sentiment";
import { demoRecsys } from "@aj/project-recsys";
import { trainBigramLM, sample } from "@aj/nlp";

console.log("Iris:", trainIris());
console.log("LinReg:", demoLinearRegression());
console.log("Sentiment:", demoSentiment());
console.log("Recsys:", demoRecsys());

const lm = trainBigramLM("hello\nworld\nhello\n");
console.log("Toy LM sample:", sample(lm, 80, 7));
