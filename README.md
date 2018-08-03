# top-games-markets
Here is JSON data processor along with involved type definitions.

### Usage
Call `formatMarkets(markets, formats, settings?)` from `src/MarketFormatter.ts` to process the data.

### Settings
Processor settings support features:
 + `copyOnWrite` (default = `true`): if `false`, `MarketFormat` properties are added directly to the `Market` objects when merging, otherwise new objects are created
 + `marketTypes` (default = `[45]`): list of market types to which apply outcome grouping
 + `qualifierStrategy: 'mapping' | 'callback'` (default: `'mapping'`): strategy to use when determining outcome group
 + `qualifierMapping`: mapping used for `mapping` strategy
 + `qualifierCallback`: callback used for `callback` strategy

`mapping` strategy requires predefined map of outcome's `naturalId` values to marker.

`callback` strategy requires qualifier function that is passed an `Outcome` object and is expected to return marker.
 
Settings can be omitted, then default values will be used. However, partial settings are not supported (except `qualifierMapping` and `qualifierCallback` fields, which can fallback to default, see below)

#### Default mapping
Default mapping is used whenever `qualifierStrategy` is `mapping` and `qualifierMapping` field is missing.
Default mapping is based on `src/market-mapping.txt` file.

#### Default qualifier callback
Default mapping is used whenever `qualifierStrategy` is `callback` and `qualifierCallback` field is missing.
Default qualifier checks for outcome's `name` field trying to split it into 2 numbers and compare them.
  
#### Custom mapping
Custom mapping can be constructed directly or with helper `buildMapping` function that takes reversed mapping with *list* of outcome's `naturalId` values for each marker;