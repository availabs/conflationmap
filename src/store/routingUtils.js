import { push } from 'connected-react-router';

import { FALCOR_HOST } from 'config';

import queryString from 'query-string';

export const getUrlQueryParams = ({ search }) => queryString.parse(search);

export const setUrlQueryParams = newUrlQueryParams => {
  const newLocation = {
    search: `?${queryString.stringify(newUrlQueryParams)}`
  };

  return push(newLocation);
};

export const createShareableUrl = urlQueryParams => {
  const { href } = window.location;
  const shareableUrl = `${href}?${queryString.stringify(urlQueryParams)}`;

  return shareableUrl;
};

export const clearUrlQueryString = () => push({ search: '' });

export const documentationRoutes = {
  'NPMRDS Final Rules': `${FALCOR_HOST}/documentation/FinalRules.pdf`,
  'HPMS Field Manual': `${FALCOR_HOST}/documentation/hpms_field_manual_dec2016.pdf`,
  'NPMRDS Descriptive Metadata Document': `${FALCOR_HOST}/documentation/NPMRDS.pdf`,
  'NPMRDS Data Quality Report': `${FALCOR_HOST}/documentation/NPMRDS_Data_Quality_Report_Q32018.pdf`
};
