/**
 * CV modules are stubs (because real training in TS needs TFJS + data + compute).
 * These wrappers are here so your platform can depend on consistent interfaces.
 */

export interface ImageClassifier {
  predict(image: { data: Uint8Array; width: number; height: number }): Promise<{ label: string; score: number }[]>;
}

export interface FaceRecognizer {
  identify(image: { data: Uint8Array; width: number; height: number }): Promise<{ personId: string; score: number }[]>;
}

/**
 * Placeholder that you replace with tfjs / face-api.js adapters.
 */
export class StubImageClassifier implements ImageClassifier {
  async predict(): Promise<{ label: string; score: number }[]> {
    return [{ label: "unknown", score: 0 }];
  }
}

export class StubFaceRecognizer implements FaceRecognizer {
  async identify(): Promise<{ personId: string; score: number }[]> {
    return [{ personId: "unknown", score: 0 }];
  }
}
