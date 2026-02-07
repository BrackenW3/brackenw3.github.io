import json
import os
import random
from datetime import datetime

import pandas as pd
import plotly.express as px
import pygwalker as pyg

# 1. Update Data Timestamp
DATA_FILE = "assets/data/data.json"
try:
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
except FileNotFoundError:
    # If file doesn't exist, start with an empty structure but preserve expected keys
    data = {"projects": []}

data["last_updated"] = datetime.now().isoformat()

with open(DATA_FILE, "w") as f:
    json.dump(data, f, indent=4)

print(f"Updated {DATA_FILE} with timestamp.")

# 2. Generate Plotly Chart
# Create sample data simulating a daily report
print("Generating sample sales data...")
df = pd.DataFrame({
    "Date": pd.date_range(start="2024-01-01", periods=30),
    "Sales": [random.randint(100, 500) for _ in range(30)],
    "Category": [random.choice(["Electronics", "Clothing", "Home"]) for _ in range(30)],
    "Profit": [random.randint(10, 100) for _ in range(30)]
})

fig = px.line(df, x="Date", y="Sales", color="Category", title=f"Daily Sales Report (Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')})")

# Save to HTML
OUTPUT_DIR = "dashboard_files"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "plotly_chart.html")

# write_html includes the necessary JS bundle for standalone viewing
fig.write_html(OUTPUT_FILE)
print(f"Generated chart at {OUTPUT_FILE}")

# 3. Generate PyGWalker Explorer
print("Generating PyGWalker explorer...")
try:
    # to_html returns a full HTML string
    walker_html = pyg.to_html(df)

    EXPLORER_FILE = os.path.join(OUTPUT_DIR, "explorer.html")
    with open(EXPLORER_FILE, "w", encoding="utf-8") as f:
        f.write(walker_html)
    print(f"Generated explorer at {EXPLORER_FILE}")
except Exception as e:
    print(f"Failed to generate PyGWalker explorer: {e}")
