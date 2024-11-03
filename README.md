# Simulating US elections with Monte carlo simulations

## How to run

Intall a python environment by:
```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run simulations and store results in data folder by tweaking the historical_simulation_pipeline.py to select the date range and:
```
python historical_simulation_pipeline.py
```

Generate visuals (this will copy processed csv files and iframes to front-end public folder) by:
```
python gen_visuals.py
```
Run the front-end by
```
cd front-end
npm install
npm run dev
```


## Data

from 538: https://projects.fivethirtyeight.com/polls/president-general/2024/
https://projects.fivethirtyeight.com/polls/data/president_polls.csv

Electoral votes from https://www.archives.gov/electoral-college/allocation
