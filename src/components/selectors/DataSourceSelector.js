import React from 'react';

import Select from 'react-select';

import { travelTimeDataSourceDisplayNames } from 'utils/constants';

const options = Object.keys(travelTimeDataSourceDisplayNames).map(
  dataSource => ({
    value: dataSource,
    label: travelTimeDataSourceDisplayNames[dataSource]
  })
);

const DataSourceSelector = props => {
  const { dataSource = 'ALL', onChange } = props;

  return (
    <Select
      value={
        dataSource
          ? {
              value: dataSource,
              label: travelTimeDataSourceDisplayNames[dataSource]
            }
          : undefined
      }
      isMulti={false}
      options={options}
      onChange={({ value }) => onChange(value)}
    />
  );
};

export default DataSourceSelector;
