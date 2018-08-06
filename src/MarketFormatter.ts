import {Market, MarketCategoryBucket, MarketEx, MarketFormat, Outcome, OutcomeGroup, OutcomeMarker} from "./types";

export type MarketFormatter = (markets: Market[], formats: MarketFormat[], settings?: FormatSettings) => MarketCategoryBucket[];

export type FormatSettings = {
  readonly copyOnWrite: boolean;
  readonly marketTypes: number[];
  readonly qualifierStrategy: 'mapping' | 'callback';
  readonly qualifierMapping?: { [id: string]: OutcomeMarker };
  readonly qualifierCallback?: (Outcome) => OutcomeMarker;
};

const DEFAULT_MAPPING = buildMapping({
  [OutcomeMarker.Home]: [114, 116, 118, 120, 122, 124, 130, 132, 134, 136, 144, 146],
  [OutcomeMarker.Draw]: [110, 128, 142, 154],
  [OutcomeMarker.Away]: [126, 138, 140, 148, 150, 152, 156, 158, 160, 162, 164, 166]
});

const DEFAULT_CALLBACK = function (outcome: Outcome): OutcomeMarker {
  const score = outcome.name.split(':');
  if (+score[0] > +score[1]) return OutcomeMarker.Home;
  if (+score[0] < +score[1]) return OutcomeMarker.Away;
  if (+score[0] === +score[1]) return OutcomeMarker.Draw;
  // return nothing for failed parsing/conversion
};

const DEFAULT_SETTINGS: FormatSettings = {
  copyOnWrite: true,
  marketTypes: [41],
  qualifierStrategy: 'mapping'
};

export function buildMapping(reversedMapping: { [id: string]: number[] | string[] }): { [id: string]: OutcomeMarker } {
  const result: { [id: string]: OutcomeMarker } = {};
  for (let marker in reversedMapping) {
    let naturalIds = reversedMapping[marker];
    (<any[]> naturalIds).forEach(id => result[id] = <OutcomeMarker> marker);
  }
  return result;
}

export const formatMarkets: MarketFormatter = function (
  markets: Market[],
  formats: MarketFormat[],
  settings: FormatSettings = DEFAULT_SETTINGS): MarketCategoryBucket[] {

  type FormatMapping = { [id: string]: { [id: string]: MarketFormat } };

  const merged = mergeMarketsWithFormats(constructFormatMapping())
    .sort((a, b) => a.weight - b.weight);
  filterInterestedMarkets(merged).forEach(function (market: MarketEx) {
    market.groupedOutcomes = groupOutcomes(markOutcomes(market.Outcomes));
  });
  return groupMarkets(merged)
    .sort((a, b) => (b.name === 'Main') - (a.name === 'Main') || a.name.localeCompare(b.name));


// --- helpers ---
  function constructFormatMapping(): FormatMapping {
    // I assume that tuple [marketType; specifiers] acts as unique key,
    // at most one MarketFormat exists for a given pair of values
    return formats.reduce(function (hash, format) {
      const marketType = format.marketType, specifiers = format.specifiers || "";
      if (!(marketType in hash)) hash[marketType] = {};
      hash[marketType][specifiers] = format;
      return hash;
    }, {});
  }

  function mergeMarketsWithFormats(formatMapping: FormatMapping) {
    return markets.map(function (market): MarketEx {
      const marketType = market.marketType, specifiers = market.specifiers || "";
      const format: MarketFormat = formatMapping[marketType][specifiers];
      // beware, Object.assign is ES2016
      return settings.copyOnWrite ?
        <MarketEx> Object.assign({}, market, format) :
        <MarketEx> Object.assign(market, format);
    });
  }

  function filterInterestedMarkets(markets: MarketEx[]) {
    const marketTypeSet = settings.marketTypes.reduce((hash, id) => (hash[id] = true, hash), {});
    return markets.filter(market => market.marketType in marketTypeSet);
  }

  function markOutcomes(outcomes: Outcome[]) {
    return outcomes.map(function (outcome) {
      let marker: OutcomeMarker;
      switch (settings.qualifierStrategy) {
        case 'mapping':
          marker = (settings.qualifierMapping || DEFAULT_MAPPING) [outcome.naturalId];
          break;
        case 'callback':
          marker = (settings.qualifierCallback || DEFAULT_CALLBACK)(outcome);
          break;
      }
      return {
        marker: marker || OutcomeMarker.Unknown,
        outcome: outcome
      }
    });
  }

  function groupOutcomes(marked): OutcomeGroup[] {
    const groups = marked.reduce(function (hash, markedOutcome) {
      if (!(markedOutcome.marker in hash)) hash[markedOutcome.marker] = [];
      return hash[markedOutcome.marker].push(markedOutcome.outcome), hash;
    }, {});

    const result: OutcomeGroup[] = [];
    for (let marker in groups)
      result.push({
        marker: <OutcomeMarker> marker,
        outcomes: groups[marker]
      });
    return result;
  }

  function groupMarkets(markets: MarketEx[]) {
    const marketsByCategory = markets.reduce(function (hash, market) {
      if (!(market.category in hash)) hash[market.category] = [];
      return hash[market.category].push(market), hash;
    }, {});
    const buckets: MarketCategoryBucket[] = [];
    for (let category in marketsByCategory)
      buckets.push({
        name: category,
        markets: marketsByCategory[category]
      });
    return buckets;
  }

};
