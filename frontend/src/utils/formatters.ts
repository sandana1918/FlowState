import { formatDistanceToNowStrict } from 'date-fns';

export const formatNumber = (value: number, digits = 0) => value.toFixed(digits);
export const formatPercent = (value: number) => `${value.toFixed(1)}%`;
export const formatMb = (value: number) => `${value.toFixed(1)} MB`;
export const formatAgo = (value: string) =>
  `${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`;
export const truncateHash = (value: string, size = 7) => value.slice(0, size);

