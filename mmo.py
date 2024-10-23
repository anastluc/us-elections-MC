import random
import math

def erf(x):
    # Approximation of the error function
    a = 8 * (math.pi - 3) / (3 * math.pi * (4 - math.pi))
    return math.copysign(math.sqrt(1 - math.exp(-x**2 * (4/math.pi + a*x**2) / (1 + a*x**2))), x)

def poll_to_win_probability(poll_percentage, margin_of_error):
    # Convert poll percentage to decimal
    p = poll_percentage / 100
    # Standard deviation (assume margin of error is 2 standard deviations)
    std_dev = margin_of_error / 200
    # Calculate z-score for 50% threshold
    z = (p - 0.5) / std_dev
    # Use error function to get probability
    return 0.5 * (1 + erf(z / math.sqrt(2)))

# Define states, their electoral votes, and poll results
states = {
    "California": {"electoral_votes": 55, "dem_poll": 60, "rep_poll": 40, "margin_of_error": 13},
    "Texas": {"electoral_votes": 38, "dem_poll": 48, "rep_poll": 52, "margin_of_error": 3},
    "Florida": {"electoral_votes": 29, "dem_poll": 41, "rep_poll": 59, "margin_of_error": 2},
    "New York": {"electoral_votes": 29, "dem_poll": 53, "rep_poll": 47, "margin_of_error": 3},
    "Pennsylvania": {"electoral_votes": 20, "dem_poll": 50, "rep_poll": 50, "margin_of_error": 2},
}

def simulate_election():
    dem_votes = 0
    rep_votes = 0
    for state, data in states.items():
        dem_win_prob = poll_to_win_probability(data["dem_poll"], data["margin_of_error"])
        if random.random() < dem_win_prob:
            dem_votes += data["electoral_votes"]
        else:
            rep_votes += data["electoral_votes"]
    return dem_votes, rep_votes

def run_monte_carlo(num_simulations):
    dem_wins = 0
    rep_wins = 0
    for _ in range(num_simulations):
        dem_votes, rep_votes = simulate_election()
        if dem_votes > rep_votes:
            dem_wins += 1
        else:
            rep_wins += 1
    return dem_wins, rep_wins

# Run the simulation
num_simulations = 10000
dem_wins, rep_wins = run_monte_carlo(num_simulations)

# Calculate probabilities
dem_prob = dem_wins / num_simulations * 100
rep_prob = rep_wins / num_simulations * 100

print(f"After {num_simulations} simulations:")
print(f"Democratic win probability: {dem_prob:.2f}%")
print(f"Republican win probability: {rep_prob:.2f}%")