#!/bin/bash

bun x esbuild index.js --format=esm --platform=node --target=node18 --bundle --minify --outdir=dist
bun x esbuild make-index.js --format=esm --platform=node --target=node18 --bundle --minify --outdir=dist

