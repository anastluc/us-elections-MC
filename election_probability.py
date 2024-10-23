import math

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
    
    return probability * 100  # Return as percentage

# Example usage
pa = 46
pb = 45
moe = 3
uv = 10

prob_a_wins = election_probability(pa, pb, moe, uv)
print(f"Probability of Candidate A winning: {prob_a_wins:.2f}%")
print(f"Probability of Candidate B winning: {100 - prob_a_wins:.2f}%")