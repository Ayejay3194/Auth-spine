export namespace columnar {
  export interface ColumnSchema {
    name: string;
    type: 'int32' | 'float64' | 'string' | 'boolean';
    nullable: boolean;
  }

  type ColumnData = Int32Array | Float64Array | string[] | boolean[];

  export class ColumnStore {
    private columns: Map<string, ColumnData> = new Map();
    private schema: ColumnSchema[];
    private length: number = 0;

    constructor(schema: ColumnSchema[]) {
      this.schema = schema;
    }

    addColumn(name: string, data: number[] | string[] | boolean[]): void {
      const columnSchema = this.schema.find(s => s.name === name);
      if (!columnSchema) throw new Error(`Column ${name} not in schema`);

      let typedData: ColumnData;

      if (columnSchema.type === 'int32') {
        typedData = new Int32Array(data as number[]);
      } else if (columnSchema.type === 'float64') {
        typedData = new Float64Array(data as number[]);
      } else {
        typedData = data as string[] | boolean[];
      }

      this.columns.set(name, typedData);
      this.length = Math.max(this.length, (data as any).length);
    }

    insert(row: Record<string, any>): void {
      for (const [name, value] of Object.entries(row)) {
        const column = this.columns.get(name);
        if (column) {
          if (column instanceof Int32Array) {
            // For simplicity, recreate array (in production would use more efficient method)
            const newArray = new Int32Array(column.length + 1);
            newArray.set(column);
            newArray[column.length] = value as number;
            this.columns.set(name, newArray);
          } else if (column instanceof Float64Array) {
            const newArray = new Float64Array(column.length + 1);
            newArray.set(column);
            newArray[column.length] = value as number;
            this.columns.set(name, newArray);
          } else {
            (column as any).push(value);
          }
        }
      }
      this.length++;
    }

    getColumn(name: string): ColumnData {
      const col = this.columns.get(name);
      if (!col) throw new Error(`Column ${name} not found`);
      return col;
    }

    filter(predicate: (row: Record<string, any>) => boolean): ColumnStore {
      const indices: number[] = [];

      for (let i = 0; i < this.length; i++) {
        const row: Record<string, any> = {};
        for (const [name] of this.columns) {
          row[name] = this.getValueAt(name, i);
        }
        if (predicate(row)) {
          indices.push(i);
        }
      }

      return this.selectRows(indices);
    }

    selectRows(indices: number[]): ColumnStore {
      const newStore = new ColumnStore(this.schema);

      for (const [name, col] of this.columns) {
        const newData: any[] = [];
        for (const idx of indices) {
          newData.push(this.getValueAt(name, idx));
        }
        newStore.addColumn(name, newData);
      }

      return newStore;
    }

    private getValueAt(name: string, index: number): any {
      const col = this.columns.get(name)!;
      if (col instanceof Int32Array || col instanceof Float64Array) {
        return col[index];
      }
      return (col as any)[index];
    }

    toRows(): Record<string, any>[] {
      const rows: Record<string, any>[] = [];

      for (let i = 0; i < this.length; i++) {
        const row: Record<string, any> = {};
        for (const [name] of this.columns) {
          row[name] = this.getValueAt(name, i);
        }
        rows.push(row);
      }

      return rows;
    }

    compress(codec: 'rle' | 'dict' = 'rle'): Buffer {
      if (codec === 'rle') {
        return this.compressRLE();
      } else if (codec === 'dict') {
        return this.compressDict();
      }
      throw new Error(`Unknown codec: ${codec}`);
    }

    private compressRLE(): Buffer {
      const buffers: Buffer[] = [];

      for (const [name, col] of this.columns) {
        if (col instanceof Int32Array || col instanceof Float64Array) {
          const compressed = this.runLengthEncode(Array.from(col));
          buffers.push(Buffer.from(JSON.stringify(compressed)));
        }
      }

      return Buffer.concat(buffers);
    }

    private compressDict(): Buffer {
      const buffers: Buffer[] = [];

      for (const [name, col] of this.columns) {
        if (typeof col[0] === 'string') {
          const dict = new Map<string, number>();
          const encoded: number[] = [];
          let dictIndex = 0;

          for (const val of col as string[]) {
            if (!dict.has(val)) {
              dict.set(val, dictIndex++);
            }
            encoded.push(dict.get(val)!);
          }

          buffers.push(Buffer.from(JSON.stringify({ dict: Array.from(dict), encoded })));
        }
      }

      return Buffer.concat(buffers);
    }

    private runLengthEncode(data: number[]): Array<[number, number]> {
      const encoded: Array<[number, number]> = [];
      let current = data[0];
      let count = 1;

      for (let i = 1; i < data.length; i++) {
        if (data[i] === current) {
          count++;
        } else {
          encoded.push([current, count]);
          current = data[i];
          count = 1;
        }
      }

      encoded.push([current, count]);
      return encoded;
    }

    getMemoryUsage(): number {
      let total = 0;
      for (const col of this.columns.values()) {
        if (col instanceof Int32Array || col instanceof Float64Array) {
          total += col.byteLength;
        } else {
          total += JSON.stringify(col).length;
        }
      }
      return total;
    }
  }

  export class StreamingColumnStore {
    private store: ColumnStore;
    private buffer: Record<string, any>[] = [];
    private bufferSize: number;

    constructor(schema: ColumnSchema[], bufferSize: number = 1000) {
      this.store = new ColumnStore(schema);
      this.bufferSize = bufferSize;
    }

    addRow(row: Record<string, any>): void {
      this.buffer.push(row);

      if (this.buffer.length >= this.bufferSize) {
        this.flush();
      }
    }

    private flush(): void {
      if (this.buffer.length === 0) return;

      const columns: Record<string, any[]> = {};

      for (const row of this.buffer) {
        for (const [key, value] of Object.entries(row)) {
          if (!columns[key]) columns[key] = [];
          columns[key].push(value);
        }
      }

      for (const [name, data] of Object.entries(columns)) {
        this.store.addColumn(name, data);
      }

      this.buffer = [];
    }

    getStore(): ColumnStore {
      this.flush();
      return this.store;
    }
  }
}
