import {Market, MarketCategoryBucket, MarketFormat} from "./types";

export type MarketFormatter = (markets: Market[], format: MarketFormat[]) => MarketCategoryBucket[];

export const formatMarkets: MarketFormatter = function(markets: Market[], format: MarketFormat[]): MarketCategoryBucket[] {
    return null;
};
