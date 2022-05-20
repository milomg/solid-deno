#!/usr/bin/env bash

deno run --no-check --allow-env --allow-net --allow-read --allow-run --allow-write --import-map ./bundler/import_map.json ./bundler/index.ts
