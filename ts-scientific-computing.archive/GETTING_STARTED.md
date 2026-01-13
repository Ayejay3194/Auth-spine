# Getting Started with TypeScript Scientific Computing

## Installation

```bash
npm install ts-scientific-computing
```

## Basic Examples

### Example 1: NumPy Array Operations

```typescript
import { NDArray, zeros, ones, arange, add, mean, std } from 'ts-scientific-computing';

// Create arrays
const arr1 = zeros([3, 3]);
const arr2 = ones([3, 3]);
const arr3 = arange(1, 10, 1);

// Element-wise operations
const result = add(arr1, arr2);

// Statistics
console.log('Mean:', mean(arr3));
console.log('Std Dev:', std(arr3));

// Array info
console.log('Shape:', arr3.getShape());
console.log('Size:', arr3.size);
```

### Example 2: Matrix Operations

```typescript
import { eye, dot, linalg } from 'ts-scientific-computing';

// Create identity matrix
const identity = eye(3);

// Matrix multiplication
const result = dot(identity, identity);

// Linear algebra
const determinant = linalg.det(identity);
const inverse = linalg.inv(identity);

console.log('Determinant:', determinant);
```

### Example 3: Plotting

```typescript
import { pyplot as plt } from 'ts-scientific-computing';

// Create data
const x = [1, 2, 3, 4, 5];
const y = [1, 4, 2, 3, 5];

// Create plot
plt.figure(8, 6);
plt.plot(x, y, 'Line Plot', 'blue');
plt.scatter(x, y, 'Data Points', 'red');
plt.xlabel('X Values');
plt.ylabel('Y Values');
plt.title('My First Plot');
plt.legend();
plt.grid(true);
plt.show();
```

### Example 4: Machine Learning - Linear Regression

```typescript
import { linear_model, preprocessing, metrics } from 'ts-scientific-computing';

// Sample data
const X = [[1, 2], [2, 3], [3, 4], [4, 5]];
const y = [3, 5, 7, 9];

// Split data
const [X_train, X_test, y_train, y_test] = 
  preprocessing.trainTestSplit(X, y, 0.25);

// Scale features
const scaler = new preprocessing.StandardScaler();
const X_train_scaled = scaler.fitTransform(X_train);
const X_test_scaled = scaler.transform(X_test);

// Train model
const model = new linear_model.LinearRegression();
model.fit(X_train_scaled, y_train);

// Evaluate
const predictions = model.predict(X_test_scaled);
const r2 = model.score(X_test_scaled, y_test);
console.log('R² Score:', r2);
```

### Example 5: Machine Learning - Classification

```typescript
import { linear_model, ensemble, metrics } from 'ts-scientific-computing';

// Sample classification data
const X = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]];
const y = [0, 0, 0, 1, 1, 1];

// Logistic Regression
const lr = new linear_model.LogisticRegression(0.01, 1000);
lr.fit(X, y);
const lr_pred = lr.predict(X);
const lr_acc = metrics.accuracyScore(y, lr_pred);
console.log('Logistic Regression Accuracy:', lr_acc);

// Random Forest
const rf = new ensemble.RandomForestClassifier(10, 5);
rf.fit(X, y);
const rf_pred = rf.predict(X);
const rf_acc = metrics.accuracyScore(y, rf_pred);
console.log('Random Forest Accuracy:', rf_acc);

// Detailed metrics
const precision = metrics.precisionScore(y, rf_pred);
const recall = metrics.recallScore(y, rf_pred);
const f1 = metrics.f1Score(y, rf_pred);
console.log('Precision:', precision);
console.log('Recall:', recall);
console.log('F1 Score:', f1);
```

### Example 6: Data Preprocessing

```typescript
import { preprocessing } from 'ts-scientific-computing';

// Raw data
const X = [[1, 100], [2, 200], [3, 300], [4, 400]];

// Standardization (zero mean, unit variance)
const scaler = new preprocessing.StandardScaler();
const X_scaled = scaler.fitTransform(X);
console.log('Scaled data:', X_scaled);

// Min-Max normalization (0-1 range)
const minmax = new preprocessing.MinMaxScaler();
const X_normalized = minmax.fitTransform(X);
console.log('Normalized data:', X_normalized);
```

### Example 7: Cross-Validation

```typescript
import { model_selection, linear_model } from 'ts-scientific-computing';

// Data
const X = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]];
const y = [3, 5, 7, 9, 11];

// K-Fold cross-validation
const kfold = new model_selection.KFold(3, false, 42);
const splits = kfold.split(X);

let totalScore = 0;
for (const [trainIdx, testIdx] of splits) {
  const X_train = trainIdx.map(i => X[i]);
  const y_train = trainIdx.map(i => y[i]);
  const X_test = testIdx.map(i => X[i]);
  const y_test = testIdx.map(i => y[i]);

  const model = new linear_model.LinearRegression();
  model.fit(X_train, y_train);
  const score = model.score(X_test, y_test);
  totalScore += score;
}

console.log('Average CV Score:', totalScore / splits.length);
```

### Example 8: Random Number Generation

```typescript
import { random } from 'ts-scientific-computing';

// Set seed for reproducibility
random.seed(42);

// Generate random arrays
const rand_uniform = random.rand(3, 3);
const rand_normal = random.randn(3, 3);
const rand_int = random.randint(0, 10, 3, 3);

console.log('Uniform random:', rand_uniform.getData());
console.log('Normal random:', rand_normal.getData());
console.log('Integer random:', rand_int.getData());
```

### Example 9: Array Manipulation

```typescript
import { reshape, transpose, flatten, concatenate, stack } from 'ts-scientific-computing';

// Create arrays
const arr1 = arange(1, 7, 1);
const arr2 = arange(7, 13, 1);

// Reshape
const reshaped = reshape(arr1, [2, 3]);
console.log('Reshaped shape:', reshaped.getShape());

// Transpose
const transposed = transpose(reshaped);
console.log('Transposed shape:', transposed.getShape());

// Flatten
const flattened = flatten(transposed);
console.log('Flattened shape:', flattened.getShape());

// Concatenate
const concatenated = concatenate([arr1, arr2], 0);
console.log('Concatenated shape:', concatenated.getShape());

// Stack
const stacked = stack([arr1, arr2], 0);
console.log('Stacked shape:', stacked.getShape());
```

### Example 10: PCA Dimensionality Reduction

```typescript
import { decomposition } from 'ts-scientific-computing';

// High-dimensional data
const X = [
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6],
  [4, 5, 6, 7]
];

// Reduce to 2 dimensions
const pca = new decomposition.PCA(2);
const X_reduced = pca.fitTransform(X);

console.log('Original shape: [4, 4]');
console.log('Reduced shape:', [X_reduced.length, X_reduced[0].length]);
console.log('Explained variance ratio:', pca.getExplainedVarianceRatio());
```

## Common Patterns

### Pattern 1: Train-Evaluate Loop

```typescript
const [X_train, X_test, y_train, y_test] = preprocessing.trainTestSplit(X, y, 0.2);

const model = new linear_model.LinearRegression();
model.fit(X_train, y_train);

const train_score = model.score(X_train, y_train);
const test_score = model.score(X_test, y_test);

console.log(`Train Score: ${train_score}, Test Score: ${test_score}`);
```

### Pattern 2: Hyperparameter Tuning

```typescript
const paramGrid = {
  nEstimators: [10, 50, 100],
  maxDepth: [5, 10, 15]
};

const grid_search = new model_selection.GridSearchCV(
  new ensemble.RandomForestClassifier(),
  paramGrid,
  5
);

grid_search.fit(X_train, y_train);
console.log('Best params:', grid_search.getBestParams());
console.log('Best score:', grid_search.getBestScore());
```

### Pattern 3: Pipeline

```typescript
// Preprocess
const scaler = new preprocessing.StandardScaler();
const X_scaled = scaler.fitTransform(X_train);

// Train
const model = new linear_model.LinearRegression();
model.fit(X_scaled, y_train);

// Evaluate
const X_test_scaled = scaler.transform(X_test);
const score = model.score(X_test_scaled, y_test);
```

## Tips and Best Practices

1. **Always scale your data** before training machine learning models
2. **Use train-test split** to evaluate model generalization
3. **Set random seeds** for reproducible results
4. **Check array shapes** when debugging dimension mismatches
5. **Use appropriate metrics** for your problem (classification vs regression)
6. **Cross-validate** to get more reliable performance estimates
7. **Start simple** with linear models before trying complex ones

## Troubleshooting

### Issue: Shape mismatch errors
**Solution**: Check array shapes using `.getShape()` and ensure dimensions align for operations.

### Issue: Poor model performance
**Solution**: 
- Scale your features using StandardScaler
- Check for data quality issues
- Try different hyperparameters
- Use cross-validation to verify results

### Issue: Memory issues with large arrays
**Solution**: 
- Process data in batches
- Use smaller array sizes for testing
- Consider using WebAssembly for performance-critical code

## Next Steps

- Explore the [API Reference](./README.md#api-reference)
- Check out [Advanced Examples](./ADVANCED_EXAMPLES.md)
- Review the [Architecture Guide](./ARCHITECTURE.md)

This pull request includes code written with the assistance of AI.
The code has **not yet been reviewed** by a human.
