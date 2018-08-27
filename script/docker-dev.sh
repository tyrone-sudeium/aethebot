#!/bin/sh

# Try to keep this short and sharp. It runs _every_ time you press F5 in
# VS Code
yarn install --production=false && yarn tsc
yarn tsc -w &
yarn debug
