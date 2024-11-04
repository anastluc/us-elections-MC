# extension of historical pipeline with the change 
# of running the simulation at a given day

import pandas as pd
import math
import random
from collections import Counter
import json
import plotly.graph_objects as go
from datetime import datetime, date, timedelta
import requests
import os 
import pickle
from electoral_numbers import ELECTORAL_NUMBERS, STATE_ABBREVIATIONS
from tqdm import tqdm


def election_probability(pa, pb, moe, uv=0):
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

def getLatestPollOfStateAndCandidateAtTime(df, state, candidateA, candidateB, verbose=True):
    
    
    # Filter the dataframe for the given state, candidates, and date
    state_candidate_polls = df[
        (df['state'] == state) & 
        ((df['answer'] == candidateA) | (df['answer'] == candidateB))
    ]
    
    if state_candidate_polls.empty:
        if verbose:
            print(f"No polls found for {candidateA} or {candidateB} in {state}")
        return None
    
    # Sort by end_date in descending order and get the first row
    latest_poll = state_candidate_polls.sort_values('end_date', ascending=False).iloc[0]

    # get the mean of the last 5
    mean_pct = state_candidate_polls.sort_values('end_date', ascending=False).head(5)["pct"].mean()
    # print(latest_poll['pct'] , mean_pct)
    
    return {
        'state': state,
        'candidate': candidateA,
        'percentage': mean_pct,#latest_poll['pct'],
        'poll_date': latest_poll['end_date'].strftime("%m/%d/%y")
    }

def simulate_election_with_probability_at_time(poll_data, given_date, verbose = False, sim_counter=None):
    if verbose and sim_counter:
        print(f"Running simulation #{sim_counter} for {given_date}")

    results = {}
    total_votes_a = 0
    total_votes_b = 0

    for state_info in ELECTORAL_NUMBERS:
        state = state_info['state']
        votes = state_info['votes']

        candidate_a_result = getLatestPollOfStateAndCandidateAtTime(poll_data, state, "Trump","Trump" , verbose=verbose)
        candidate_b_result = getLatestPollOfStateAndCandidateAtTime(poll_data, state, "Harris","Biden" , verbose=verbose)

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

def generate_date_list(start_date, end_date, step =1):
    date_list = []
    current_date = start_date
    while current_date <= end_date:
        date_list.append(current_date.strftime("%m/%d/%y"))
        current_date += timedelta(days=step)
    return date_list

def simulate_for_date(df,dat,verbose=False):
    trump_counter = 0
    harris_counter = 0
    tie_counter = 0
    results_results = []
    for i in tqdm(range(NUMBER_OF_SIMULATIONS)):
        results, votes_a, votes_b = simulate_election_with_probability_at_time(df, dat, verbose=False, sim_counter=i)
        
        if votes_a > votes_b:
            winner = "Trump"
            trump_counter +=1
        elif votes_a < votes_b:
            winner = "Harris"
            harris_counter +=1
        else:
            winner="Tie!"
            tie_counter += 1
        if verbose:
            print(f"Simulation #{i} winner:{winner} ")
        results_results.append(results)
    
    return trump_counter,harris_counter,tie_counter,results_results


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

def dict_to_tuple(d):
    return tuple(sorted((k, dict_to_tuple(v) if isinstance(v, dict) else v) for k, v in d.items()))


def count_combination_freqs(given_date_results):
    # Convert each dictionary to a tuple of items
    tuple_list = [dict_to_tuple(d) for d in given_date_results]

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

    # sort from most frequent to least frequent combination
    formatted_results.sort(key=lambda x: x['frequency'], reverse=True)
    
    return formatted_results


def render_combination(combination, number_of_occurences,given_date, order,votes_T,votes_H):
    df = pd.DataFrame(combination, columns=['State', 'Info'])
    df['Winner'] = df['Info'].apply(lambda x: dict(x)['winner'])
    df['Votes'] = df['Info'].apply(lambda x: dict(x)['votes'])
    df['State'] = df['State'].map(STATE_ABBREVIATIONS)

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
    fig.update_layout(
        title_text=f'Most frequent #{order} simulation ({number_of_occurences} times) with data up to {given_date}| Trump:{votes_T} Harris:{votes_H}',
        geo_scope='usa',
        width=750,
        height=600
    )
    fig.write_html(f"data/historical/election_map_{given_date}_{order}_{NUMBER_OF_SIMULATIONS}.html")

def fetch_latest_poll_data():
    filename = f"data/president_polls_LATEST.csv"
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


if __name__ == "__main__":
    NUMBER_OF_SIMULATIONS = 100
    NUMBER_OF_SIMULATIONS = 1000
    # NUMBER_OF_SIMULATIONS = 20000

    fetch_latest_poll_data()
    filename = f"data/president_polls_LATEST.csv"
    df = pd.read_csv(filename)
    df['end_date'] = pd.to_datetime(df['end_date'], format="%m/%d/%y")
                                    #format='mixed',dayfirst=False, yearfirst=False)

   
    # start_date =  datetime(2024, 8, 1)   

    # dates = generate_date_list(start_date, end_date, step=7)
    start_date =  datetime(2024, 9, 1)
    end_date = datetime(2024, 11, 4)
    dates = generate_date_list(start_date, end_date, step=1)
    print(dates)

    for dat in dates:
        date_object = datetime.strptime(dat, "%m/%d/%y").date()
        df_date = df[
            (df['end_date'].dt.date <= date_object)
        ]
        
        trump_counter,harris_counter,tie_counter,results_results = simulate_for_date(df_date,dat,verbose=False)
            
        print(f"TOTAL: Trump: {trump_counter} Harris: {harris_counter} Tie: {tie_counter}")

        given_date_results = convert_results(results_results)

        combination_counts = count_combination_freqs(given_date_results)
        print(f"Most common winning combination occured: {combination_counts[0]['frequency']} times, followed by: {combination_counts[1]['frequency']}, {combination_counts[2]['frequency']}, {combination_counts[3]['frequency']}, {combination_counts[4]['frequency']} ...")

        # store top-10 combinations render in files
        for ord in range(0,10):
            render_combination(
                combination=combination_counts[ord]["combination"]['result_details'],
                number_of_occurences=combination_counts[ord]["frequency"],
                given_date=date_object.strftime('%Y_%m_%d'), 
                order=ord,
                votes_T=combination_counts[ord]["combination"]["trump_votes"],
                votes_H=combination_counts[ord]["combination"]["harris_votes"])
        # simulate_election_with_probability_at_time(df, dat, verbose=True)

        file_name = f"data/historical/election_results_{date_object.strftime('%Y_%m_%d')}_{NUMBER_OF_SIMULATIONS}.pickle"

        # Save the list
        with open(file_name, 'wb') as file:
            pickle.dump(given_date_results, file)




