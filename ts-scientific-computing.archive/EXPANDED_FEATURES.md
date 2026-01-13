# Expanded Features - TypeScript Scientific Computing

This document outlines all the new features added to expand the NumPy, Matplotlib, and Scikit-learn implementations.

## NumPy Expansions

### Mathematical Functions (advanced.ts)

**Trigonometric Functions:**
- `sin(arr)` - Element-wise sine
- `cos(arr)` - Element-wise cosine
- `tan(arr)` - Element-wise tangent

**Exponential & Logarithmic:**
- `exp(arr)` - Element-wise exponential
- `log(arr)` - Natural logarithm
- `log10(arr)` - Base-10 logarithm
- `sqrt(arr)` - Element-wise square root
- `power(arr, exponent)` - Element-wise power

**Rounding & Clipping:**
- `round(arr, decimals)` - Round to N decimal places
- `floor(arr)` - Floor function
- `ceil(arr)` - Ceiling function
- `clip(arr, min, max)` - Clip values to range
- `absolute(arr)` - Absolute value

**Array Operations:**
- `unique(arr)` - Get unique values
- `sort(arr, axis)` - Sort array
- `argsort(arr)` - Get indices that would sort array
- `where(condition, x, y)` - Conditional element selection

**Statistical Functions:**
- `percentile(arr, q)` - Calculate percentile
- `quantile(arr, q)` - Calculate quantile (0-1 scale)
- `cov(X)` - Covariance matrix
- `corrcoef(X)` - Correlation coefficient matrix
- `histogram(arr, bins)` - Compute histogram
- `digitize(arr, bins)` - Digitize array into bins

### Interpolation (interpolate.ts)

**interp1d Class:**
```typescript
const f = new interpolate.interp1d(x_data, y_data, 'linear');
const y_new = f.evaluate(x_new);
```

Supported kinds: `'linear'`, `'nearest'`

**interp Function:**
```typescript
const y_interp = interpolate.interp(x_new, x_data, y_data);
```

## Matplotlib Expansions

### Advanced Styling (advanced.ts)

**Colormap Class:**
- Pre-built colormaps: `viridis`, `plasma`, `inferno`, `magma`, `cividis`, `cool`, `hot`, `spring`, `summer`, `autumn`, `winter`
- `getColor(value)` - Get color from colormap

**Style Class:**
- `setLinewidth(width)` - Set line width
- `setLinestyle(style)` - Set line style (`'-'`, `'--'`, `'-.'`, `':'`)
- `setMarker(marker)` - Set marker style
- `setMarkersize(size)` - Set marker size
- `setAlpha(alpha)` - Set transparency (0-1)

**Annotation Class:**
- Add text annotations to plots
- `setFontsize(size)` - Set font size
- `setColor(color)` - Set text color

**Patch Class:**
- Create rectangular patches
- `setEdgecolor(color)` - Set edge color
- `setLinewidth(width)` - Set edge width

**Text Class:**
- Advanced text rendering
- `setFontweight(weight)` - Set font weight
- `setHa(ha)` - Set horizontal alignment
- `setVa(va)` - Set vertical alignment

### Subplots (subplots.ts)

**subplots Function:**
```typescript
const [fig, axes] = subplots(2, 2, [12, 10]);
axes[0].plot(x, y);
axes[1].scatter(x, y);
```

**subplot Function:**
```typescript
const ax = subplot(2, 2, 1);
```

## Scikit-learn Expansions

### Clustering (cluster/index.ts)

**KMeans:**
```typescript
const kmeans = new cluster.KMeans(3, 100);
kmeans.fit(X);
const labels = kmeans.predict(X_new);
const centroids = kmeans.getCentroids();
```

**DBSCAN:**
```typescript
const dbscan = new cluster.DBSCAN(0.5, 5);
dbscan.fit(X);
const labels = dbscan.getLabels();
```

### Feature Selection (feature_selection/index.ts)

**SelectKBest:**
```typescript
const selector = new feature_selection.SelectKBest(10);
const X_selected = selector.fitTransform(X, y);
const indices = selector.getSelectedIndices();
const scores = selector.getScores();
```

**VarianceThreshold:**
```typescript
const selector = new feature_selection.VarianceThreshold(0.1);
const X_selected = selector.fitTransform(X);
```

**Mutual Information:**
```typescript
const scores = feature_selection.mutualInfo(X, y, 10);
```

### Decision Trees (tree/index.ts)

**DecisionTreeClassifier:**
```typescript
const tree = new tree.DecisionTreeClassifier(10);
tree.fit(X_train, y_train);
const predictions = tree.predict(X_test);
const score = tree.score(X_test, y_test);
```

**DecisionTreeRegressor:**
```typescript
const tree = new tree.DecisionTreeRegressor(10);
tree.fit(X_train, y_train);
const predictions = tree.predict(X_test);
const r2 = tree.score(X_test, y_test);
```

## Statistics Module (stats/index.ts)

### Probability Distributions

**Normal Distribution:**
```typescript
const pdf = stats.norm.pdf(x, mu, sigma);
const cdf = stats.norm.cdf(x, mu, sigma);
const ppf = stats.norm.ppf(p, mu, sigma);  // Percent point function
```

**Uniform Distribution:**
```typescript
const pdf = stats.uniform.pdf(x, a, b);
const cdf = stats.uniform.cdf(x, a, b);
const ppf = stats.uniform.ppf(p, a, b);
```

**Exponential Distribution:**
```typescript
const pdf = stats.exponential.pdf(x, lambda);
const cdf = stats.exponential.cdf(x, lambda);
const ppf = stats.exponential.ppf(p, lambda);
```

### Hypothesis Tests

**Independent T-Test:**
```typescript
const { statistic, pvalue } = stats.ttest_ind(a, b);
```

**Pearson Correlation:**
```typescript
const { correlation, pvalue } = stats.pearsonr(x, y);
```

**Chi-Square Test:**
```typescript
const { statistic, pvalue } = stats.chi2_test(observed, expected);
```

## Usage Examples

### Example 1: Advanced NumPy Operations

```typescript
import { sqrt, exp, sin, cos, unique, sort, percentile } from 'ts-scientific-computing';

const arr = arange(1, 10, 1);
const sqrt_arr = sqrt(arr);
const exp_arr = exp(arr);
const sin_arr = sin(arr);

const unique_vals = unique(arr);
const sorted_arr = sort(arr);
const p95 = percentile(arr, 95);
```

### Example 2: Interpolation

```typescript
import { interpolate } from 'ts-scientific-computing';

const x = [0, 1, 2, 3, 4];
const y = [0, 1, 4, 9, 16];

const f = new interpolate.interp1d(x, y, 'linear');
const y_interp = f.evaluate([0.5, 1.5, 2.5]);
```

### Example 3: Clustering

```typescript
import { cluster } from 'ts-scientific-computing';

const X = [[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]];

const kmeans = new cluster.KMeans(2, 100);
kmeans.fit(X);
const labels = kmeans.predict(X);
console.log('Cluster labels:', labels);
console.log('Centroids:', kmeans.getCentroids());
```

### Example 4: Feature Selection

```typescript
import { feature_selection } from 'ts-scientific-computing';

const X = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const y = [0, 1, 0];

const selector = new feature_selection.SelectKBest(2);
const X_selected = selector.fitTransform(X, y);
console.log('Selected features:', selector.getSelectedIndices());
```

### Example 5: Decision Trees

```typescript
import { tree } from 'ts-scientific-computing';

const X_train = [[1, 2], [2, 3], [3, 4], [4, 5]];
const y_train = [0, 0, 1, 1];

const clf = new tree.DecisionTreeClassifier(5);
clf.fit(X_train, y_train);
const predictions = clf.predict(X_train);
const accuracy = clf.score(X_train, y_train);
console.log('Accuracy:', accuracy);
```

### Example 6: Statistical Tests

```typescript
import { stats } from 'ts-scientific-computing';

// Normal distribution
const pdf = stats.norm.pdf(0, 0, 1);
const cdf = stats.norm.cdf(1.96, 0, 1);

// T-test
const a = [1, 2, 3, 4, 5];
const b = [2, 3, 4, 5, 6];
const { statistic, pvalue } = stats.ttest_ind(a, b);
console.log(`T-statistic: ${statistic}, p-value: ${pvalue}`);

// Pearson correlation
const x = [1, 2, 3, 4, 5];
const y = [2, 4, 5, 4, 6];
const { correlation, pvalue: p } = stats.pearsonr(x, y);
console.log(`Correlation: ${correlation}, p-value: ${p}`);
```

## Feature Comparison

| Feature | NumPy | Matplotlib | Scikit-learn | Stats |
|---------|-------|-----------|--------------|-------|
| Array Operations | ✅ | - | - | - |
| Mathematical Functions | ✅ | - | - | - |
| Interpolation | ✅ | - | - | - |
| Plotting | - | ✅ | - | - |
| Advanced Styling | - | ✅ | - | - |
| Subplots | - | ✅ | - | - |
| Clustering | - | - | ✅ | - |
| Feature Selection | - | - | ✅ | - |
| Decision Trees | - | - | ✅ | - |
| Distributions | - | - | - | ✅ |
| Hypothesis Tests | - | - | - | ✅ |

## Performance Notes

- All implementations are pure TypeScript with no external dependencies (except dev dependencies)
- Suitable for educational purposes and prototyping
- For production use with large datasets, consider using Python libraries via bindings or WebAssembly compilation
- Memory usage is optimized using typed arrays (Float64Array)

## Future Enhancements

- FFT (Fast Fourier Transform) for NumPy
- 3D plotting for Matplotlib
- Support for sparse matrices
- GPU acceleration via WebGL
- More clustering algorithms (hierarchical, OPTICS)
- Neural network support
- Time series analysis

This pull request includes code written with the assistance of AI.
The code has **not yet been reviewed** by a human.
