const rangeFilterMethod = ({ id, value }, row) => {
  const v = value.replace(/\s/, '');

  if (!v) {
    return true;
  }

  const colValue = row[id] === null ? NaN : +row[id];

  if (Number.isNaN(colValue)) {
    return false;
  }

  let min;
  let max;
  const isRange = v.match(/:/);

  if (isRange) {
    const [l, r] = v.split(':');
    min = l.length ? +l : Number.NEGATIVE_INFINITY;
    max = r.length ? +r : Number.POSITIVE_INFINITY;
  } else {
    min = max = +v;
  }

  return colValue >= +min && colValue <= +max;
};

export default rangeFilterMethod;
