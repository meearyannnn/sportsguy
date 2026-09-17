export type NewsTag =
  | 'Breaking'
  | 'Race Weekend'
  | 'Driver Market'
  | 'Technical'
  | 'Regulation';

export interface SecondarySource {
  name: string;
  link: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  pubDate: string;
  tag: NewsTag;
  isBreaking: boolean;
  secondarySources: SecondarySource[];
}

export type LiveEventType =
  | 'overtake'
  | 'pit'
  | 'fastest_lap'
  | 'flag'
  | 'battle'
  | 'radio';

export interface LiveEventItem {
  id: string;
  timestamp: string;
  lap?: number;
  type: LiveEventType;
  title: string;
  detail: string;
  driverId?: string;
  driverCode?: string;
  teamColor?: string;
  badgeText: string;
  severity?: 'normal' | 'yellow' | 'red' | 'purple' | 'green';
}
