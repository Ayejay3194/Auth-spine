export namespace pandas {
  export class DataFrame {
    private data: Record<string, number[]> = {};
    private index: number[] = [];
    private columns: string[] = [];

    constructor(data?: Record<string, number[]> | number[][], columns?: string[], index?: number[]) {
      if (Array.isArray(data)) {
        this.fromArray(data, columns, index);
      } else if (data) {
        this.data = data;
        this.columns = Object.keys(data);
        this.index = index || Array.from({ length: data[this.columns[0]]?.length || 0 }, (_, i) => i);
      }
    }

    private fromArray(arr: number[][], columns?: string[], index?: number[]): void {
      const n_rows = arr.length;
      const n_cols = arr[0]?.length || 0;

      this.columns = columns || Array.from({ length: n_cols }, (_, i) => `col_${i}`);
      this.index = index || Array.from({ length: n_rows }, (_, i) => i);

      for (let j = 0; j < n_cols; j++) {
        this.data[this.columns[j]] = [];
        for (let i = 0; i < n_rows; i++) {
          this.data[this.columns[j]].push(arr[i][j]);
        }
      }
    }

    shape(): [number, number] {
      return [this.index.length, this.columns.length];
    }

    head(n: number = 5): DataFrame {
      const newData: Record<string, number[]> = {};
      for (const col of this.columns) {
        newData[col] = this.data[col].slice(0, n);
      }
      return new DataFrame(newData, this.columns, this.index.slice(0, n));
    }

    tail(n: number = 5): DataFrame {
      const newData: Record<string, number[]> = {};
      const start = Math.max(0, this.index.length - n);
      for (const col of this.columns) {
        newData[col] = this.data[col].slice(start);
      }
      return new DataFrame(newData, this.columns, this.index.slice(start));
    }

    describe(): Record<string, Record<string, number>> {
      const stats: Record<string, Record<string, number>> = {};

      for (const col of this.columns) {
        const values = this.data[col];
        const sorted = [...values].sort((a, b) => a - b);

        stats[col] = {
          count: values.length,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          std: this.calculateStd(values),
          min: Math.min(...values),
          '25%': sorted[Math.floor(values.length * 0.25)],
          '50%': sorted[Math.floor(values.length * 0.5)],
          '75%': sorted[Math.floor(values.length * 0.75)],
          max: Math.max(...values)
        };
      }

      return stats;
    }

    private calculateStd(values: number[]): number {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    }

    select(columns: string[]): DataFrame {
      const newData: Record<string, number[]> = {};
      for (const col of columns) {
        if (this.data[col]) {
          newData[col] = [...this.data[col]];
        }
      }
      return new DataFrame(newData, columns, this.index);
    }

    filter(condition: boolean[]): DataFrame {
      const newData: Record<string, number[]> = {};
      const newIndex: number[] = [];

      for (const col of this.columns) {
        newData[col] = [];
      }

      for (let i = 0; i < condition.length; i++) {
        if (condition[i]) {
          newIndex.push(this.index[i]);
          for (const col of this.columns) {
            newData[col].push(this.data[col][i]);
          }
        }
      }

      return new DataFrame(newData, this.columns, newIndex);
    }

    groupBy(column: string): GroupBy {
      return new GroupBy(this, column);
    }

    sort(column: string, ascending: boolean = true): DataFrame {
      const indices = Array.from({ length: this.index.length }, (_, i) => i);
      indices.sort((a, b) => {
        const cmp = this.data[column][a] - this.data[column][b];
        return ascending ? cmp : -cmp;
      });

      const newData: Record<string, number[]> = {};
      const newIndex: number[] = [];

      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        newIndex.push(this.index[idx]);
        for (const col of this.columns) {
          if (!newData[col]) newData[col] = [];
          newData[col].push(this.data[col][idx]);
        }
      }

      return new DataFrame(newData, this.columns, newIndex);
    }

    toArray(): number[][] {
      const result: number[][] = [];
      for (let i = 0; i < this.index.length; i++) {
        const row: number[] = [];
        for (const col of this.columns) {
          row.push(this.data[col][i]);
        }
        result.push(row);
      }
      return result;
    }

    getColumn(column: string): number[] {
      return this.data[column] || [];
    }

    getRow(index: number): number[] {
      const row: number[] = [];
      for (const col of this.columns) {
        row.push(this.data[col][index]);
      }
      return row;
    }

    getColumns(): string[] {
      return this.columns;
    }

    getIndex(): number[] {
      return this.index;
    }
  }

  export class GroupBy {
    private df: DataFrame;
    private column: string;
    private groups: Record<number, number[]> = {};

    constructor(df: DataFrame, column: string) {
      this.df = df;
      this.column = column;
      this.createGroups();
    }

    private createGroups(): void {
      const columnData = this.df.getColumn(this.column);
      const index = this.df.getIndex();

      for (let i = 0; i < columnData.length; i++) {
        const key = columnData[i];
        if (!this.groups[key]) {
          this.groups[key] = [];
        }
        this.groups[key].push(i);
      }
    }

    mean(): Record<number, Record<string, number>> {
      const result: Record<number, Record<string, number>> = {};
      const columns = this.df.getColumns();

      for (const [key, indices] of Object.entries(this.groups)) {
        result[Number(key)] = {};
        for (const col of columns) {
          const colData = this.df.getColumn(col);
          const values = indices.map(i => colData[i]);
          result[Number(key)][col] = values.reduce((a, b) => a + b, 0) / values.length;
        }
      }

      return result;
    }

    sum(): Record<number, Record<string, number>> {
      const result: Record<number, Record<string, number>> = {};
      const columns = this.df.getColumns();

      for (const [key, indices] of Object.entries(this.groups)) {
        result[Number(key)] = {};
        for (const col of columns) {
          const colData = this.df.getColumn(col);
          const values = indices.map(i => colData[i]);
          result[Number(key)][col] = values.reduce((a, b) => a + b, 0);
        }
      }

      return result;
    }

    count(): Record<number, number> {
      const result: Record<number, number> = {};
      for (const [key, indices] of Object.entries(this.groups)) {
        result[Number(key)] = indices.length;
      }
      return result;
    }
  }

  export function readCSV(csv: string): DataFrame {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const data: Record<string, number[]> = {};

    for (const header of headers) {
      data[header.trim()] = [];
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        data[headers[j].trim()].push(Number(values[j]));
      }
    }

    return new DataFrame(data, headers.map(h => h.trim()));
  }

  export function concat(dfs: DataFrame[], axis: number = 0): DataFrame {
    if (axis === 0) {
      const allData: Record<string, number[]> = {};
      const columns = dfs[0].getColumns();
      const allIndex: number[] = [];
      let indexCounter = 0;

      for (const df of dfs) {
        for (const col of columns) {
          if (!allData[col]) allData[col] = [];
          allData[col].push(...df.getColumn(col));
        }
        for (let i = 0; i < df.getIndex().length; i++) {
          allIndex.push(indexCounter++);
        }
      }

      return new DataFrame(allData, columns, allIndex);
    }

    throw new Error('axis=1 not yet implemented');
  }

  export function merge(df1: DataFrame, df2: DataFrame, on: string): DataFrame {
    const key1 = df1.getColumn(on);
    const key2 = df2.getColumn(on);
    const result: Record<string, number[]> = {};

    const cols1 = df1.getColumns();
    const cols2 = df2.getColumns();

    for (const col of cols1) {
      result[col] = [];
    }
    for (const col of cols2) {
      if (col !== on) {
        result[col] = [];
      }
    }

    for (let i = 0; i < key1.length; i++) {
      for (let j = 0; j < key2.length; j++) {
        if (key1[i] === key2[j]) {
          for (const col of cols1) {
            result[col].push(df1.getColumn(col)[i]);
          }
          for (const col of cols2) {
            if (col !== on) {
              result[col].push(df2.getColumn(col)[j]);
            }
          }
        }
      }
    }

    return new DataFrame(result, Object.keys(result));
  }
}
