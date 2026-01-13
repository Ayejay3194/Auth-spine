# TypeScript Scientific Computing Library

A comprehensive TypeScript implementation of NumPy, Matplotlib, and Scikit-learn, bringing powerful scientific computing capabilities to the JavaScript ecosystem.

## Features

### NumPy-like Array Operations
- **NDArray**: N-dimensional array class with efficient memory management
- **Creation**: `zeros`, `ones`, `arange`, `linspace`, `eye`, `full`
- **Operations**: Element-wise arithmetic, matrix multiplication, dot products
- **Statistics**: `mean`, `sum`, `std`, `variance`, `min`, `max`
- **Manipulation**: `reshape`, `transpose`, `flatten`, `concatenate`, `stack`
- **Linear Algebra**: Matrix inversion, determinant calculation
- **Random**: Seeded random number generation with various distributions

### Matplotlib-like Visualization
- **Figure & Axes**: Object-oriented plotting interface
- **Plot Types**: Line plots, scatter plots, bar charts, histograms
- **Styling**: Color management, labels, titles, legends, grids
- **PyPlot Interface**: Familiar MATLAB-style API

### Scikit-learn-like Machine Learning
- **Preprocessing**: StandardScaler, MinMaxScaler, train_test_split
- **Model Selection**: KFold cross-validation, GridSearchCV
- **Linear Models**: LinearRegression, LogisticRegression
- **Ensemble**: RandomForestClassifier
- **Metrics**: Accuracy, precision, recall, F1 score, confusion matrix, MSE, MAE, R²
- **Decomposition**: PCA (Principal Component Analysis)

## Installation

```bash
npm install ts-scientific-computing
```

## Quick Start

### NumPy Operations

```typescript
import { np } from 'ts-scientific-computing';

// Create arrays
const arr1 = np.zeros([3, 3]);
const arr2 = np.ones([3, 3]);
const arr3 = np.arange(0, 10, 1);

// Array operations
const result = np.add(arr1, arr2);
const product = np.dot(arr1, arr2);

// Statistics
const mean = np.mean(arr3);
const std = np.std(arr3);

// Linear algebra
const inv = np.linalg.inv(arr1);
const det = np.linalg.det(arr1);
```

### Matplotlib Plotting

```typescript
import { plt } from 'ts-scientific-computing';

// Create figure and plot
plt.figure(10, 6);
plt.plot([1, 2, 3, 4], [1, 4, 2, 3], 'Line Plot', 'blue');
plt.scatter([1, 2, 3], [1, 2, 3], 'Scatter', 'red');
plt.xlabel('X Axis');
plt.ylabel('Y Axis');
plt.title('My Plot');
plt.legend();
plt.savefig('plot.png');
plt.show();
```

### Scikit-learn Machine Learning

```typescript
import { sklearn } from 'ts-scientific-computing';

// Data preprocessing
const scaler = new sklearn.preprocessing.StandardScaler();
const X_scaled = scaler.fitTransform(X_train);

// Train-test split
const [X_train, X_test, y_train, y_test] = 
  sklearn.preprocessing.trainTestSplit(X, y, 0.2);

// Linear regression
const model = new sklearn.linear_model.LinearRegression();
model.fit(X_train, y_train);
const predictions = model.predict(X_test);
const score = model.score(X_test, y_test);

// Random forest
const rf = new sklearn.ensemble.RandomForestClassifier(100, 10);
rf.fit(X_train, y_train);
const rf_predictions = rf.predict(X_test);

// Model evaluation
const accuracy = sklearn.metrics.accuracyScore(y_test, rf_predictions);
const f1 = sklearn.metrics.f1Score(y_test, rf_predictions);
```

## Project Structure

```
ts-scientific-computing/
├── src/
│   ├── numpy/
│   │   ├── core/
│   │   │   └── ndarray.ts
│   │   ├── creation.ts
│   │   ├── operations.ts
│   │   ├── statistics.ts
│   │   ├── manipulation.ts
│   │   ├── linalg/
│   │   ├── random/
│   │   └── index.ts
│   ├── matplotlib/
│   │   ├── figure.ts
│   │   ├── axes.ts
│   │   ├── pyplot.ts
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── sklearn/
│   │   ├── preprocessing/
│   │   ├── model_selection/
│   │   ├── linear_model/
│   │   ├── ensemble/
│   │   ├── metrics/
│   │   ├── decomposition/
│   │   └── index.ts
│   └── index.ts
├── vendor/
│   ├── numpy/
│   ├── matplotlib/
│   └── scikit-learn/
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

## API Reference

### NumPy Module

#### Array Creation
- `zeros(shape: number[]): NDArray`
- `ones(shape: number[]): NDArray`
- `full(shape: number[], fillValue: number): NDArray`
- `arange(start: number, stop?: number, step?: number): NDArray`
- `linspace(start: number, stop: number, num?: number): NDArray`
- `eye(n: number, m?: number, k?: number): NDArray`

#### Array Operations
- `add(a: NDArray, b: NDArray): NDArray`
- `subtract(a: NDArray, b: NDArray): NDArray`
- `multiply(a: NDArray, b: NDArray): NDArray`
- `divide(a: NDArray, b: NDArray): NDArray`
- `dot(a: NDArray, b: NDArray): NDArray`
- `matmul(a: NDArray, b: NDArray): NDArray`

#### Statistics
- `mean(arr: NDArray, axis?: number): number | NDArray`
- `sum(arr: NDArray, axis?: number): number | NDArray`
- `std(arr: NDArray, axis?: number): number | NDArray`
- `variance(arr: NDArray, axis?: number): number | NDArray`
- `min(arr: NDArray): number`
- `max(arr: NDArray): number`

#### Array Manipulation
- `reshape(arr: NDArray, newShape: number[]): NDArray`
- `transpose(arr: NDArray, axes?: number[]): NDArray`
- `flatten(arr: NDArray): NDArray`
- `concatenate(arrays: NDArray[], axis?: number): NDArray`
- `stack(arrays: NDArray[], axis?: number): NDArray`

#### Linear Algebra
- `linalg.inv(a: NDArray): NDArray`
- `linalg.det(a: NDArray): number`

#### Random
- `random.seed(s: number): void`
- `random.rand(...shape: number[]): NDArray`
- `random.randn(...shape: number[]): NDArray`
- `random.randint(low: number, high: number, ...shape: number[]): NDArray`
- `random.choice(a: NDArray, size?: number): NDArray`

### Matplotlib Module

#### Figure
- `Figure(width?: number, height?: number, dpi?: number)`
- `addSubplot(rows: number, cols: number, index: number): Axes`
- `setTitle(title: string): void`
- `savefig(filename: string): void`
- `show(): void`

#### Axes
- `plot(x: number[], y: number[], label?: string, color?: string): void`
- `scatter(x: number[], y: number[], label?: string, color?: string): void`
- `bar(x: number[], height: number[], label?: string, color?: string): void`
- `hist(data: number[], bins?: number, label?: string, color?: string): void`
- `setXLabel(label: string): void`
- `setYLabel(label: string): void`
- `setTitle(title: string): void`
- `legend(): void`
- `grid(visible?: boolean): void`

#### PyPlot
- `figure(width?: number, height?: number, dpi?: number): Figure`
- `subplot(rows: number, cols: number, index: number): Axes`
- `plot(x: number[], y: number[], label?: string, color?: string): void`
- `scatter(x: number[], y: number[], label?: string, color?: string): void`
- `bar(x: number[], height: number[], label?: string, color?: string): void`
- `hist(data: number[], bins?: number, label?: string, color?: string): void`
- `xlabel(label: string): void`
- `ylabel(label: string): void`
- `title(title: string): void`
- `legend(): void`
- `grid(visible?: boolean): void`
- `savefig(filename: string): void`
- `show(): void`
- `close(): void`

### Scikit-learn Module

#### Preprocessing
- `StandardScaler.fit(X: number[][]): this`
- `StandardScaler.transform(X: number[][]): number[][]`
- `StandardScaler.fitTransform(X: number[][]): number[][]`
- `MinMaxScaler.fit(X: number[][]): this`
- `MinMaxScaler.transform(X: number[][]): number[][]`
- `MinMaxScaler.fitTransform(X: number[][]): number[][]`
- `trainTestSplit(X: number[][], y: number[], testSize?: number, randomState?: number): [number[][], number[][], number[], number[]]`

#### Linear Models
- `LinearRegression.fit(X: number[][], y: number[]): this`
- `LinearRegression.predict(X: number[][]): number[]`
- `LinearRegression.score(X: number[][], y: number[]): number`
- `LogisticRegression.fit(X: number[][], y: number[]): this`
- `LogisticRegression.predict(X: number[][]): number[]`
- `LogisticRegression.predictProba(X: number[][]): number[][]`
- `LogisticRegression.score(X: number[][], y: number[]): number`

#### Ensemble
- `RandomForestClassifier.fit(X: number[][], y: number[]): this`
- `RandomForestClassifier.predict(X: number[][]): number[]`
- `RandomForestClassifier.score(X: number[][], y: number[]): number`

#### Metrics
- `accuracyScore(yTrue: number[], yPred: number[]): number`
- `precisionScore(yTrue: number[], yPred: number[], average?: string): number`
- `recallScore(yTrue: number[], yPred: number[], average?: string): number`
- `f1Score(yTrue: number[], yPred: number[], average?: string): number`
- `confusionMatrix(yTrue: number[], yPred: number[]): number[][]`
- `meanSquaredError(yTrue: number[], yPred: number[]): number`
- `meanAbsoluteError(yTrue: number[], yPred: number[]): number`
- `rSquaredScore(yTrue: number[], yPred: number[]): number`

#### Model Selection
- `KFold(n_splits?: number, shuffle?: boolean, randomState?: number)`
- `KFold.split(X: number[][]): Array<[number[], number[]]>`
- `GridSearchCV(estimator: any, paramGrid: Record<string, any[]>, cv?: number)`
- `GridSearchCV.fit(X: number[][], y: number[]): this`
- `GridSearchCV.getBestParams(): Record<string, any>`
- `GridSearchCV.getBestScore(): number`

#### Decomposition
- `PCA(nComponents?: number)`
- `PCA.fit(X: number[][]): this`
- `PCA.transform(X: number[][]): number[][]`
- `PCA.fitTransform(X: number[][]): number[][]`
- `PCA.getExplainedVarianceRatio(): number[]`

## Building

```bash
npm run build
```

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Documentation

Generate TypeDoc documentation:

```bash
npm run docs
```

## Performance Considerations

- Arrays use `Float64Array` for efficient memory usage
- Operations are optimized for common use cases
- For large-scale computations, consider using WebAssembly or native bindings
- Random number generation uses a simple LCG algorithm; use cryptographic libraries for security-sensitive applications

## Limitations

- PCA eigenvalue decomposition is simplified
- Some advanced NumPy features are not implemented
- Matplotlib is a simplified interface without full rendering capabilities
- Scikit-learn implementations are educational and may not match production performance

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All functions have proper type annotations
- Tests are included for new features
- Documentation is updated

## License

BSD-3-Clause (matching NumPy, Matplotlib, and Scikit-learn licenses)

## References

- [NumPy Documentation](https://numpy.org/doc/)
- [Matplotlib Documentation](https://matplotlib.org/)
- [Scikit-learn Documentation](https://scikit-learn.org/)

## Acknowledgments

This project is inspired by and provides TypeScript bindings/implementations of:
- NumPy - The fundamental package for array computing
- Matplotlib - Python 2D plotting library
- Scikit-learn - Machine learning library for Python

This pull request includes code written with the assistance of AI.
The code has **not yet been reviewed** by a human.
