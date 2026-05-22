export interface ZScoreResult {
  mean: number;
  stddev: number;
  zscore: number;
  isAnomaly: boolean;
}

export const calculateMean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

export const calculateStdDev = (values: number[], mean: number) => {
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

export const calculateZScore = (
  baseline: number[],
  value: number,
  threshold: number
): ZScoreResult | null => {
  if (baseline.length === 0) {
    return null;
  }
  const mean = calculateMean(baseline);
  const stddev = calculateStdDev(baseline, mean);
  if (stddev === 0) {
    return {
      mean,
      stddev,
      zscore: 0,
      isAnomaly: false
    };
  }
  const zscore = (value - mean) / stddev;
  return {
    mean,
    stddev,
    zscore,
    isAnomaly: zscore > threshold
  };
};

