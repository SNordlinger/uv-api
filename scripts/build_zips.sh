#!/bin/bash

set -ex

ZIPCODE_URL="https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip"

rm -f data/*.zip data/*.txt
curl -L --retry 3 -o data/zcta.zip $ZIPCODE_URL
unzip data/zcta.zip -d data
python scripts/zipcodes.py data/2020_Gaz_zcta_national.txt
