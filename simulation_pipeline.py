import pandas as pd
import math
import random
from collections import Counter
import json
import plotly.graph_objects as go
from datetime import datetime
import requests
import os 
import pickle


NUMBER_OF_SIMULATIONS = 100
NUMBER_OF_SIMULATIONS = 1000
# NUMBER_OF_SIMULATIONS = 10000
# NUMBER_OF_SIMULATIONS = 100_000

electoral = """
Alabama - 9 votes

Kentucky - 8 votes

North Dakota - 3 votes

Alaska - 3 votes

Louisiana - 8 votes

Ohio - 17 votes

Arizona - 11 votes

Maine - 4 votes

Oklahoma - 7 votes

Arkansas - 6 votes

Maryland - 10 votes

Oregon - 8 votes

California - 54 votes

Massachusetts - 11 votes

Pennsylvania - 19 votes

Colorado - 10 votes

Michigan - 15 votes

Rhode Island - 4 votes

Connecticut - 7 votes

Minnesota - 10 votes

South Carolina - 9 votes

Delaware - 3 votes

Mississippi - 6 votes

South Dakota - 3 votes

District of Columbia - 3 votes

Missouri - 10 votes

Tennessee - 11 votes

Florida - 30 votes

Montana - 4 votes

Texas - 40 votes

Georgia - 16 votes

Nebraska - 5 votes

Utah - 6 votes

Hawaii - 4 votes

Nevada - 6 votes

Vermont - 3 votes

Idaho - 4 votes

New Hampshire - 4 votes

Virginia - 13 votes

Illinois - 19 votes

New Jersey - 14 votes

Washington - 12 votes

Indiana - 11 votes

New Mexico - 5 votes

West Virginia - 4 votes

Iowa - 6 votes

New York - 28 votes

Wisconsin - 10 votes

Kansas - 6 votes

North Carolina - 16 votes

Wyoming - 3 votes
"""
state_abbr = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
}



######
#  1 #
######
# fetch todays poll csv
current_date = datetime.now()
today_formatted_date = current_date.strftime("%d_%m_%Y")
os.makedirs('data', exist_ok=True)
filename = f"data/president_polls_{today_formatted_date}.csv"
csv_url = "https://projects.fivethirtyeight.com/polls/data/president_polls.csv"
response = requests.get(csv_url)

# Check if the request was successful
if response.status_code == 200:
    # Write the content to a file
    with open(filename, 'wb') as file:
        file.write(response.content)
    print(f"CSV file has been downloaded and saved as '{filename}'")
else:
    print(f"Failed to download the CSV file. Status code: {response.status_code}")
    exit()


df = pd.read_csv(filename)


ele_list = electoral.split("\n")
ele_list = [item for item in ele_list if item!=""]

def parse_state_votes(state_vote_list):
    result = []
    for item in state_vote_list:
        # Split the string into state and votes parts
        parts = item.split(' - ')
        if len(parts) == 2:
            state = parts[0]
            # Extract the number of votes and convert to integer
            votes = int(parts[1].split()[0])
            # Create a dictionary and append to result
            result.append({"state": state, "votes": votes})
    return result

parsed_list = parse_state_votes(ele_list)

def getLatestPollOfStateAndCandidate(df, state, candidateA, candidateB, verbose =True ):
    # Filter the dataframe for the given state and candidate
    state_candidate_polls = df[(df['state'] == state) & ((df['answer'] == candidateA) | (df['answer'] == candidateB)  )]
    
    if state_candidate_polls.empty:
        if verbose:
            print(f"No polls found for {candidateA} or {candidateB} in {state}")
        return None
    
    # Sort by end_date in descending order and get the first row
    latest_poll = state_candidate_polls.sort_values('end_date', ascending=False).iloc[0]
    
    return {
        'state': state,
        'candidate': candidateA,
        'percentage': latest_poll['pct'],
        'poll_date': latest_poll['end_date']
    }

def simulate_election(parsed_list, poll_data):
    results = {}
    total_votes_a = 0
    total_votes_b = 0

    for state_info in parsed_list:
        state = state_info['state']
        votes = state_info['votes']

        candidate_a_result = getLatestPollOfStateAndCandidate(poll_data, state, "Trump","Trump")
        candidate_b_result = getLatestPollOfStateAndCandidate(poll_data, state, "Harris","Biden")

        if candidate_a_result and candidate_b_result:
            pct_a = candidate_a_result['percentage']
            pct_b = candidate_b_result['percentage']
            
            results[state] = {
                'Trump': pct_a,
                'Harris': pct_b,
                'votes': votes,
                'winner': 'Trump' if pct_a > pct_b else 'Harris',
                'date': max(candidate_a_result['poll_date'], candidate_b_result['poll_date'])
            }
            
            if pct_a > pct_b:
                total_votes_a += votes
            else:
                total_votes_b += votes
        else:
            print(f"Couldn't find poll data for both candidates in {state}")
    
    return results, total_votes_a, total_votes_b

def election_probability(pa, pb, moe, uv):
    # Adjust for undecided voters
    total = pa + pb
    adj_pa = pa / total * (100 - uv)
    adj_pb = pb / total * (100 - uv)
    
    # Calculate spread
    spread = adj_pa - adj_pb
    
    # Calculate standard error
    se = moe / 1.96
    
    # Calculate z-score
    z = spread / (se * math.sqrt(2))
    
    # Use error function to calculate probability
    probability = 0.5 * (1 + math.erf(z / math.sqrt(2)))
    
    return probability * 100 

def simulate_election_with_probability(parsed_list, poll_data, verbose = True):
    results = {}
    total_votes_a = 0
    total_votes_b = 0

    for state_info in parsed_list:
        state = state_info['state']
        votes = state_info['votes']

        candidate_a_result = getLatestPollOfStateAndCandidate(poll_data, state, "Trump","Trump" , verbose=verbose)
        candidate_b_result = getLatestPollOfStateAndCandidate(poll_data, state, "Harris","Biden" , verbose=verbose)

        if candidate_a_result and candidate_b_result:
            pct_a = candidate_a_result['percentage']
            pct_b = candidate_b_result['percentage']

            election_probability_a = election_probability(pct_a,pct_b,5,0)
            election_probability_b = 100 - election_probability_a

            winner_a = random.random()*100 < election_probability_a
            winner_b = not winner_a
            winner_str = "Trump" if winner_a else "Harris"

            if verbose:
                print(f"{state} pct(trump|harris):{pct_a:.1f}|{pct_b:.1f} probs:{election_probability_a:.1f}|{election_probability_b:.1f} winner:{winner_str}")
            
            results[state] = {
                'Trump': pct_a,
                'Harris': pct_b,
                'votes': votes,
                'winner': 'Trump' if winner_a else 'Harris', #if pct_a > pct_b else 'Harris',
                'date': max(candidate_a_result['poll_date'], candidate_b_result['poll_date'])
            }
            
            if winner_a:#pct_a > pct_b:
                total_votes_a += votes
            else:
                total_votes_b += votes
        else:
            if verbose:
                print(f"Couldn't find poll data for both candidates in {state}")
    
    return results, total_votes_a, total_votes_b


trump_counter = 0
harris_counter = 0
tie_counter = 0
results_results = []
for i in range(NUMBER_OF_SIMULATIONS):
    results, votes_a, votes_b = simulate_election_with_probability(parsed_list, df, verbose=False)
    if votes_a > votes_b:
        winner = "Trump"
        trump_counter +=1
    elif votes_a < votes_b:
        winner = "Harris"
        harris_counter +=1
    else:
        winner="Tie!"
        tie_counter += 1
    print(f"Simulation #{i} winner:{winner} ")
    results_results.append(results)
    
print(f"TOTAL: trump: {trump_counter} harris:{harris_counter} tie:{tie_counter}")


def convert_results(results_list):
    new_results = []
    
    for result in results_list:
        trump_votes = 0
        harris_votes = 0
        
        for state_data in result.values():
            if state_data['winner'] == 'Trump':
                trump_votes += state_data['votes']
            elif state_data['winner'] == 'Harris':
                harris_votes += state_data['votes']
        
        new_result = {
            "result_details": result,
            "trump_votes": trump_votes,
            "harris_votes": harris_votes
        }
        
        new_results.append(new_result)
    
    return new_results

results_with_votes = convert_results(results_results)


file_name = f"data/election_results_{today_formatted_date}_{NUMBER_OF_SIMULATIONS}.pickle"

# Save the list
with open(file_name, 'wb') as file:
    pickle.dump(results_with_votes, file)

print(f"Election results have been saved to {file_name}")





def dict_to_tuple(d):
    return tuple(sorted((k, dict_to_tuple(v) if isinstance(v, dict) else v) for k, v in d.items()))

# Convert each dictionary to a tuple of items
tuple_list = [dict_to_tuple(d) for d in results_with_votes]

# Count the occurrences of each unique combination
combination_counts = Counter(tuple_list)

# Format the results as requested
formatted_results = [
    {
        "combination": json.loads(json.dumps(dict(combo))),
        "frequency": count
    }
    for combo, count in combination_counts.items()
]



formatted_results.sort(key=lambda x: x['frequency'], reverse=True)



data = formatted_results[0]["combination"]['result_details']



df = pd.DataFrame(data, columns=['State', 'Info'])
df['Winner'] = df['Info'].apply(lambda x: dict(x)['winner'])
df['Votes'] = df['Info'].apply(lambda x: dict(x)['votes'])
df['State'] = df['State'].map(state_abbr)

fig = go.Figure(data=go.Choropleth(
    locations=df['State'], 
    locationmode='USA-states', 
    z=df['Winner'].map({'Trump': 0, 'Harris': 1}),  # 0 for Trump, 1 for Harris
    text=df['State'] + '<br>Winner: ' + df['Winner'] + '<br>Votes: ' + df['Votes'].astype(str),
    hoverinfo='text',
    colorscale=[[0, 'red'], [1, 'blue']],
    showscale=False,
    marker_line_color='white',
    marker_line_width=0.5
))

# Update the layout
fig.update_layout(
    title_text=f'2024 US Presidential Election most prominent simulation - updated with data up to {today_formatted_date}',
    geo_scope='usa',
    width=1000,
    height=600
)

# Show the map
# fig.show()

# If you want to save the map as an HTML file
fig.write_html(f"data/election_map_{today_formatted_date}_{NUMBER_OF_SIMULATIONS}.html")