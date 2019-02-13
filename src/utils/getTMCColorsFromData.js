const d3scale = require('d3-scale');

const colorsList = [
  '#2266b2',
  '#479acf',
  '#9bd0ea',
  '#f4ae8c',
  '#dc6147',
  '#b11021'
];

const getTMCColorsFromData = (data, domain, range = colorsList) => {
  const min = domain[0];
  const max = domain[domain.length - 1];
  const step = (max - min) / range.length;
  const breaksDomain = range.map((_, i) => min + i * step);

  const colorScale = d3scale
    .scaleThreshold()
    .domain(breaksDomain)
    .range(range);

  return Object.keys(data).reduce((acc, tmc) => {
    const v = data[tmc];
    acc[tmc] = v !== null && Number.isFinite(+v) ? colorScale(v) : 'white';
    return acc;
  }, {});
};

export default getTMCColorsFromData;
