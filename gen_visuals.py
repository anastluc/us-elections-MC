import pickle
import os
import matplotlib.pyplot as plt
import numpy as np
import plotly.graph_objects as go
import pandas as pd
from electoral_numbers import ELECTORAL_NUMBERS, STATE_ABBREVIATIONS
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from collections import Counter
import json

def find_least_harris(sorted_by_count):
    i=1
    while True:
        comb = sorted_by_count[len(sorted_by_count)-i]
        i+=1
        print(f'{comb["combination"]["harris_votes"]} > {comb["combination"]["trump_votes"]}')
        if comb["combination"]["harris_votes"] > comb["combination"]["trump_votes"]:
            print(f'Found Harris win: {comb["combination"]["harris_votes"]} > {comb["combination"]["trump_votes"]}')
            return comb
        if i>100:# guard
            return None

def find_least_trump(sorted_by_count):
    i=1
    while True:
        comb = sorted_by_count[len(sorted_by_count)-i]
        i+=1
        print(f'{comb["combination"]["harris_votes"]} > {comb["combination"]["trump_votes"]}')
        if comb["combination"]["harris_votes"] < comb["combination"]["trump_votes"]:
            print(f'Found Trump win: {comb["combination"]["harris_votes"]} > {comb["combination"]["trump_votes"]}')
            return comb
        if i>100:# guard
            return None

def electoral_college_histogram(data, given_date):
    df = pd.DataFrame(data)
    df['difference'] = df['trump_votes'] - df['harris_votes']

    # Count occurrences of each unique difference
    value_counts = df['difference'].value_counts().sort_index()

    # Create the figure
    fig = go.Figure()

    # Add bar chart (which will look like a histogram without bins)
    fig.add_trace(
        go.Bar(
            x=value_counts.index,
            y=value_counts.values,
            marker_color=['blue' if x < 0 else 'red' for x in value_counts.index],
            opacity=0.7,
            name='Vote Difference'
        )
    )

    # Update layout
    max_diff = max(abs(df['difference'].min()), abs(df['difference'].max()))
    fig.update_layout(
        title=f'Distribution of Simulated Electoral College Outcomes on {given_date}',
        xaxis=dict(
            title='Vote Difference',
            range=[-max_diff, max_diff],
            tickvals=[-max_diff, -200, -100, -50, -25, -10, 0, 10, 25, 50, 100, 200, max_diff],
            ticktext=[f'D+{max_diff}', 'D+200', 'D+100', 'D+50', 'D+25','D+10', '0', 'R+10', 'R+25', 'R+50', 'R+100', 'R+200', f'R+{max_diff}'],
            zeroline=True,
            zerolinewidth=2,
            zerolinecolor='black'
        ),
        yaxis=dict(
            title='Count of Simulations'
        ),
        showlegend=False,
        # height=325,
        # width=590,
        bargap=0  # Remove gaps between bars
    )

    # Add annotations
    fig.add_annotation(x=-max_diff/2, y=1.05, xref="x", yref="paper", text="Harris wins", showarrow=False, font=dict(color="blue"))
    fig.add_annotation(x=max_diff/2, y=1.05, xref="x", yref="paper", text="Trump wins", showarrow=False, font=dict(color="red"))

    # Show the plot
    fig.write_html(f"./front-end/public/data/visuals/election_map_{given_date}_histogram.html",full_html=False)

def electoral_college_visualization_scatter_plot(data,date_part):
    # Convert data to DataFrame
    df = pd.DataFrame(data)
    df['difference'] = df['trump_votes'] - df['harris_votes']
    df['winner'] = df['difference'].apply(lambda x: 'Trump' if x > 0 else 'Harris')

    # Create the scatter plot
    fig = go.Figure()

    # Add traces for Trump and Harris
    for winner, color in [('Trump', 'red'), ('Harris', 'blue')]:
        df_winner = df[df['winner'] == winner]
        fig.add_trace(go.Scattergl(
            x=df_winner['difference'],
            y=df_winner.index,
            mode='markers',
            name=winner,
            marker=dict(
                color=color,
                size=6,
                opacity=0.6
            ),
            hovertemplate=
            '<b>Winner:</b> %{text}<br>' +
            '<b>Difference:</b> %{x} votes<br>' +
            '<extra></extra>',
            text=df_winner['winner']
        ))

    # Update layout
    max_diff = max(abs(df['difference'].min()), abs(df['difference'].max()))
    fig.update_layout(
        title='Simulated Electoral College Outcomes',
        xaxis=dict(
            title='Vote Difference',
            range=[-max_diff, max_diff],
            tickvals=[-max_diff, -200, -100, -50, 0, 50, 100, 200, max_diff],
            ticktext=[f'D+{max_diff}', 'D+200', 'D+100', 'D+50', '0', 'R+50', 'R+100', 'R+200', f'R+{max_diff}'],
            zeroline=True,
            zerolinewidth=2,
            zerolinecolor='black'
        ),
        yaxis=dict(
            title='Simulation',
            showticklabels=False
        ),
        showlegend=False,
        annotations=[
            dict(x=-max_diff/2, y=1.05, xref="x", yref="paper", text="Harris wins", showarrow=False, font=dict(color="blue")),
            dict(x=max_diff/2, y=1.05, xref="x", yref="paper", text="Trump wins", showarrow=False, font=dict(color="red"))
        ]
    )

    # Show the plot
    fig.write_html(f"./front-end/public/data/visuals/election_map_{date_part}_scatter.html",full_html=False)

def render_most_improbable_harris_combination(combination, number_of_occurences,given_date, order,votes_T,votes_H):
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
        title_text=f'Most improbable simulation ({number_of_occurences} times) with data up to {given_date}| Trump:{votes_T} Harris:{votes_H}',
        geo_scope='usa',
        # height=325,
        # width=590,
    )
    fig.write_html(f"./front-end/public/data/visuals/election_map_{given_date}_most_improbable_harris.html",full_html=False)

def render_most_improbable_trump_combination(combination, number_of_occurences,given_date, order,votes_T,votes_H):
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
        title_text=f'Most improbable simulation ({number_of_occurences} times) with data up to {given_date}| Trump:{votes_T} Harris:{votes_H}',
        geo_scope='usa',
        # height=325,
        # width=590,
    )
    fig.write_html(f"./front-end/public/data/visuals/election_map_{given_date}_most_improbable_trump.html",full_html=False)

def render_most_frequent_combination(combination, number_of_occurences,given_date, order,votes_T,votes_H):
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
        title_text=f'Most frequent simulation ({number_of_occurences} times) with data up to {given_date}| Trump:{votes_T} Harris:{votes_H}',
        geo_scope='usa',
        # height=325,
        # width=590,
    )
    fig.write_html(f"./front-end/public/data/visuals/election_map_{given_date}_most_frequent.html",full_html=False)

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

def analyse_pickle(pickle_file):
    filename = f"data/historical/{pickle_file}"
    date_part = pickle_file.split("election_results_")[1].split("_100")[0]
    print(date_part)

    with open(filename, 'rb') as file:
        loaded_object = pickle.load(file)

        electoral_college_visualization_scatter_plot(loaded_object, date_part)
        electoral_college_histogram(loaded_object, date_part)

        combination_counts = count_combination_freqs(loaded_object)


        least_harris = find_least_harris(combination_counts)
        least_trump = find_least_trump(combination_counts)

        render_most_frequent_combination(
                combination=combination_counts[0]["combination"]['result_details'],
                number_of_occurences=combination_counts[0]["frequency"],
                given_date=date_part,
                order=0,
                votes_T=combination_counts[0]["combination"]["trump_votes"],
                votes_H=combination_counts[0]["combination"]["harris_votes"]
            )
    
        if least_harris:
            render_most_improbable_harris_combination(
            
                combination=least_harris["combination"]['result_details'],
                number_of_occurences=least_harris["frequency"],
                given_date=date_part,
                order=0,
                votes_T=least_harris["combination"]["trump_votes"],
                votes_H=least_harris["combination"]["harris_votes"]
        )
        else:
            print(f"{date_part} is None")

        render_most_improbable_trump_combination(
            combination=least_trump["combination"]['result_details'],
            number_of_occurences=least_trump["frequency"],
            given_date=date_part,
            order=0,
            votes_T=least_trump["combination"]["trump_votes"],
            votes_H=least_trump["combination"]["harris_votes"]
        )



    
def iterate_pickles_directory(directory):
    files =  [f for f in os.listdir(directory) if f.endswith("pickle")]
    return files

if __name__ == "__main__":
    pickles_files = iterate_pickles_directory("./data/historical")

    for pickle_file in pickles_files:
        analyse_pickle(pickle_file)