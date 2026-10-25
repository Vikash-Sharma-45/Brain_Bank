# Markdown Rendering Test

This note checks inline math such as $X \in \mathbb{R}^{n \times (p+1)}$ and
block math:

$$
\hat{\beta} = (X^T X)^{-1} X^T y
$$

Multi-line aligned equation:

$$
\begin{aligned}
\hat{\beta}_0 &= \bar{y} - \sum_{j=1}^{p}\hat{\beta}_j\bar{x}_j \\
\hat{\beta}_j &= \text{coefficient for feature } j
\end{aligned}
$$

## Callout title and body ordering

> [!question] Question $$X=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix}$$, $y=\begin{bmatrix}2\\3\\5\end{bmatrix}$. Find $\hat\beta$.
> - The matrices, comma, and trailing sentence must stay in one body paragraph in source order.
> - Nested content remains readable.
>   > [!solution]- Solution
>   > This unknown type falls back to the note style and stays collapsed.

> [!question] Question Single feature $x$, $\beta=[0,1]$, data: use both values to estimate the response.
> The title ends before the first expression; subsequent expressions and text stay in this paragraph.

> [!formula] Model $$y = \beta_0 + \beta_1x$$
> This is the only expression on the first line after its title, so it should display centered below the title.

> [!note] Fractions
> - Accuracy: $\frac{TP+TN}{TP+TN+FP+FN}$
> - Precision: $\frac{TP}{TP+FP}$
> - F1 score: $2\cdot\frac{Prec\cdot Rec}{Prec+Rec}$
> - Display fraction:
>   $$
>   \frac{TP+TN}{TP+TN+FP+FN}
>   $$

## Tables and code

| Metric | Formula | Meaning |
| --- | --- | --- |
| Accuracy | $\frac{TP+TN}{TP+TN+FP+FN}$ | Overall correctness |
| Precision | $\frac{TP}{TP+FP}$ | Positive prediction quality |

```js
function predict(features, coefficients) {
  return features.reduce((sum, feature, index) => {
    return sum + feature * coefficients[index];
  }, 0);
}
```

## Callout types

> [!note] Notes
> A note callout with **bold text** and inline math $x \in \mathbb{R}$.

> [!info] Information
> Helpful context.

> [!tip] Tip
> A useful hint.

> [!warning] Warning
> Take care with assumptions.

> [!danger] Danger
> An important caution.

> [!example] Example
> A short worked example.

> [!quote] Quote
> A quoted statement.

> [!definition] Definition
> A defined term.

> [!theorem] Theorem
> A mathematical claim.

> [!important] Important
> A key point.

> [!question] Properties
> - First property
> - Second property with a nested list:
>   - Nested item

> [!unknown-callout] Custom title fallback
> Unknown types use the note icon and accent while preserving this title.
