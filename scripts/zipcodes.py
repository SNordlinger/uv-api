import csv
import sys
import json
from pathlib import Path

def main():
    path = Path(sys.argv[1])
    zipcodes = {}
    with open(path, newline='') as csvfile:
        csvreader = csv.reader(csvfile, delimiter='\t')
        next(csvreader)
        for row in csvreader:
            zipcode = row[0]
            lat = float(row[5].strip())
            lon = float(row[6].strip())
            zipcodes[zipcode] = {
                'latitude': lat,
                'longitude': lon,
                'zipcode': zipcode
            }
    out_path = path.with_name('zips.json')
    with open(out_path, 'w') as outfile:
        json.dump(zipcodes, outfile)

if __name__ == '__main__':
    main()
