import * as markets from './markets.json';
import * as marketFormat from './format.json';

const result = markets.map(val => {

  // add category, weight and add display name if it exist
  if (val.specifiers) {

    return Object.assign({}, val, marketFormat.filter(v => {
      return v.marketType === val.marketType && v.specifiers === val.specifiers
    })[0]);

  } else {

    return Object.assign({}, val, marketFormat.filter(v => {
      return v.marketType === val.marketType;
    })[0]);
  }
});

// sort the results
result.sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));


// create market sections for UI display
var group_to_values = result.reduce(function (obj, item) {
  obj[item.category] = obj[item.category] || [];
  obj[item.category].push(item);
  return obj;
}, {});

var resultSections = Object.keys(group_to_values).map(function (key) {
  return { name: key, markets: group_to_values[key] };
});

const firstMarket = "Main";
resultSections.sort(function (x, y) { return x == firstMarket ? -1 : y == firstMarket ? 1 : 0; });


console.log(resultSections);
