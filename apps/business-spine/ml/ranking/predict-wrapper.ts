/**
 * TypeScript wrapper for Python ML prediction model
 * Provides type-safe interface to scikit-learn model
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface MLFeatures {
  [key: string]: number;
}

export interface MLPrediction {
  score: number;
  probability?: number;
  features: MLFeatures;
  timestamp: string;
}

export interface MLPredictionResult {
  success: boolean;
  predictions?: MLPrediction[];
  error?: string;
  processingTimeMs?: number;
}

export class MLRankingPredictor {
  private pythonPath: string;
  private scriptPath: string;
  private modelPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = path.join(__dirname, 'predict.py');
    this.modelPath = path.join(__dirname, 'model.pkl');
  }

  /**
   * Predict scores for a batch of feature sets
   */
  async predict(features: MLFeatures[]): Promise<MLPredictionResult> {
    const startTime = Date.now();

    try {
      // Convert features to JSON input for Python script
      const input = JSON.stringify(features);

      // Spawn Python process
      const result = await this.runPythonScript(input);

      // Parse output
      const predictions: MLPrediction[] = JSON.parse(result).map((pred: any, idx: number) => ({
        score: pred.score || pred.prediction || 0,
        probability: pred.probability,
        features: features[idx],
        timestamp: new Date().toISOString()
      }));

      const processingTimeMs = Date.now() - startTime;

      return {
        success: true,
        predictions,
        processingTimeMs
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Predict score for a single feature set
   */
  async predictSingle(features: MLFeatures): Promise<MLPrediction | null> {
    const result = await this.predict([features]);

    if (result.success && result.predictions && result.predictions.length > 0) {
      return result.predictions[0];
    }

    return null;
  }

  /**
   * Check if model file exists
   */
  modelExists(): boolean {
    const fs = require('fs');
    return fs.existsSync(this.modelPath);
  }

  /**
   * Run Python script and capture output
   */
  private runPythonScript(input: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.scriptPath]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Send input to Python script
      python.stdin.write(input);
      python.stdin.end();
    });
  }
}

// Export singleton instance
export const mlPredictor = new MLRankingPredictor();
export default mlPredictor;
