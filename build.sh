#!/bin/sh
set -e

pnpm build
rm -rf docs
cp -r .output/public docs
