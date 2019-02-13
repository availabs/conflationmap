#!/bin/bash

# https://github.com/facebook/create-react-app/issues/4536#issuecomment-393647911
node --max-old-space-size=5000 node_modules/react-scripts/scripts/build.js
