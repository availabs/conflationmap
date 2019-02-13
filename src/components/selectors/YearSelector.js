import React from 'react';

import Select from 'react-select';

const DEFAULT_YEARS = [2017, 2018];

const YearSelector = props => {
  const { year, years = DEFAULT_YEARS, onChange } = props;

  return (
    <Select
      value={
        year
          ? {
              value: +year,
              label: year
            }
          : undefined
      }
      isMulti={false}
      options={years.map(y => ({
        value: +y,
        label: +y
      }))}
      onChange={({ value }) => onChange(value)}
    />
  );
};

export default YearSelector;
