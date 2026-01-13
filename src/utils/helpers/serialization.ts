export namespace serialization {
  export interface ModelSnapshot {
    type: string;
    version: string;
    timestamp: number;
    data: Record<string, any>;
  }

  export class ModelSerializer {
    static serialize(model: any, modelType: string): string {
      const snapshot: ModelSnapshot = {
        type: modelType,
        version: '1.0.0',
        timestamp: Date.now(),
        data: this.extractModelData(model)
      };

      return JSON.stringify(snapshot);
    }

    static deserialize(json: string, ModelClass: any): any {
      const snapshot: ModelSnapshot = JSON.parse(json);

      if (!snapshot.type || !snapshot.data) {
        throw new Error('Invalid model snapshot format');
      }

      const model = new ModelClass();
      this.restoreModelData(model, snapshot.data);

      return model;
    }

    private static extractModelData(model: any): Record<string, any> {
      const data: Record<string, any> = {};

      for (const key in model) {
        if (model.hasOwnProperty(key) && !key.startsWith('_')) {
          const value = model[key];

          if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            data[key] = value;
          } else if (Array.isArray(value)) {
            data[key] = this.serializeArray(value);
          } else if (value && typeof value === 'object') {
            data[key] = this.extractModelData(value);
          }
        }
      }

      return data;
    }

    private static restoreModelData(model: any, data: Record<string, any>): void {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];

          if (Array.isArray(value)) {
            model[key] = this.deserializeArray(value);
          } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (!model[key]) {
              model[key] = {};
            }
            this.restoreModelData(model[key], value);
          } else {
            model[key] = value;
          }
        }
      }
    }

    private static serializeArray(arr: any[]): any[] {
      return arr.map(item => {
        if (item instanceof Float64Array || item instanceof Float32Array) {
          return Array.from(item);
        } else if (Array.isArray(item)) {
          return this.serializeArray(item);
        } else if (item && typeof item === 'object') {
          return this.extractModelData(item);
        }
        return item;
      });
    }

    private static deserializeArray(arr: any[]): any[] {
      return arr.map(item => {
        if (Array.isArray(item)) {
          return this.deserializeArray(item);
        }
        return item;
      });
    }
  }

  export function saveModel(model: any, modelType: string): string {
    return ModelSerializer.serialize(model, modelType);
  }

  export function loadModel(json: string, ModelClass: any): any {
    return ModelSerializer.deserialize(json, ModelClass);
  }

  export function modelToJSON(model: any): Record<string, any> {
    return {
      type: model.constructor.name,
      timestamp: Date.now(),
      data: ModelSerializer['extractModelData'](model)
    };
  }

  export function jsonToModel(json: Record<string, any>, ModelClass: any): any {
    const model = new ModelClass();
    ModelSerializer['restoreModelData'](model, json.data);
    return model;
  }
}
