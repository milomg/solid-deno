#!/usr/bin/env bash

if ! command -v pnpm &> /dev/null
then
    echo "pnpm could not be found"
    exit 1
fi

cd app
pnpm i
cd -
