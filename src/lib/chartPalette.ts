import type { ChartConfig } from '@/components/ui/chart';

export const SERIES_THEMES = [
  { light: '#2a78d6', dark: '#3987e5' },
  { light: '#eb6834', dark: '#d95926' },
  { light: '#1baf7a', dark: '#199e70' },
  { light: '#eda100', dark: '#c98500' },
  { light: '#e87ba4', dark: '#d55181' },
  { light: '#008300', dark: '#008300' },
  { light: '#4a3aa7', dark: '#9085e9' },
  { light: '#e34948', dark: '#e66767' }
];

export const MAX_SERIES = SERIES_THEMES.length;

const OTHER_THEME = { light: '#8a8a8a', dark: '#9a9a9a' };

export function seriesConfig(keys: { key: string; label: string }[]): ChartConfig {
  const config: ChartConfig = {};
  keys.slice(0, MAX_SERIES).forEach((entry, index) => {
    config[entry.key] = { label: entry.label, theme: entry.key === 'other' ? OTHER_THEME : SERIES_THEMES[index] };
  });
  return config;
}

export const daysSince = (value: string | Date | null | undefined): number | null =>
  value ? Math.max(0, Math.ceil((Date.now() - new Date(value).getTime()) / 86400000)) : null;
