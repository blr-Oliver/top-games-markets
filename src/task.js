import * as markets from './markets.json';
import * as marketFormats from './format.json';
import {formatMarkets} from "./MarketFormatter";

console.log(formatMarkets(markets, marketFormats));
