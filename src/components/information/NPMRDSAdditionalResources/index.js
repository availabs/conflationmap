import React from 'react';

import { documentationRoutes } from 'store/routingUtils'

const NPMRDSAdditionalResources = () => (
  <ol>
    { Object.keys(documentationRoutes).map(fileName =>
    <li key={`additional_resources_${fileName}_link`}>
      <cite>
        <a
          href={documentationRoutes[fileName]}
          target="_blank"
          rel="noopener noreferrer"
        >
      {fileName}
        </a>
      </cite>
    </li>)}
  </ol>
);

export default NPMRDSAdditionalResources;
