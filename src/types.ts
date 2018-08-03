export type intAsString = string;
export type floatAsString = string;
export type booleanAsInt = 0 | 1;
export enum Status { Active = 'Active', Deactivated = 'Deactivated' }
export enum OutcomeMarker { Home = 'Home', Draw = 'Draw' , Away = 'Away', Unknown = 'Unknown' }

export interface Outcome {
  id: number;
  name: string;
  naturalId: number | intAsString;
  odds: number | floatAsString;
  active: boolean;
}

export interface OutcomeGroup {
  [id: string]: Outcome[];
}

export interface Market {
  id: number;
  name: string;
  marketType: number;
  specifiers: string;
  status: Status;
  favourite: booleanAsInt;
  Outcomes: Outcome[];
}

export interface MarketFormat {
  marketType: number;
  specifiers: string;
  displayName: string;
  weight: number;
  category: string;
}

export interface MarketEx extends Market, MarketFormat {
  groupedOutcomes?: OutcomeGroup[];
}

export interface MarketCategoryBucket {
  name: string;
  markets: MarketEx[];
}
