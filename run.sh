#!/usr/bin/env bash

deno run --no-check -A --import-map bundler/import_map.json bundler/index.ts
