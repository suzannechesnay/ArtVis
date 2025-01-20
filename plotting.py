from fastapi import FastAPI, Query
import pandas as pd
import numpy as np
import os
import folium
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib import colormaps
import plotly.graph_objects as go
import plotly.io as pio
import json
import io


app = FastAPI()

# Allow your frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to restrict allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get-map-data")
async def get_map_data(
    startYear: int = Query(..., description="The start year for filtering"),
    endYear: int = Query(..., description="The end year for filtering"),
):
    """
    Endpoint to fetch map data filtered by a year range.
    """
    # Call the `create_map` function
    map_file = create_map(startYear, endYear)
    return FileResponse(map_file, media_type="text/html", filename=os.path.basename(map_file), headers={"Content-Disposition": "inline"})
    
def create_map(startdate, enddate):
    # Load the dataset
    df = pd.read_csv('data_cleaning_and_queries' + os.sep + 'exhibitions.csv')
    
    # Filter for the specified years
    filtered_df = df.loc[(df['e_startdate'] >= startdate) & (df['e_startdate'] <= enddate)]

    # Group by latitude and longitude
    grouped = filtered_df.groupby(['e_latitude', 'e_longitude']).size().reset_index(name='count')

    # Create a base map
    m = folium.Map(location=[50, 10], zoom_start=4)

    # Add circle markers
    for _, row in grouped.iterrows():
        folium.CircleMarker(
            location=[row['e_latitude'], row['e_longitude']],
            radius=row['count'] / 10,
            color='red',
            fill=True,
            fill_color='red',
            fill_opacity=0.6,
            tooltip=folium.Tooltip(
                f"<span style='font-size: 16px;'>Exhibitions: {row['count']}</span>",  # Custom font size
                sticky=True),
            stroke=False
        ).add_to(m)

    # Save the map as an HTML file
    map_path = "exhibition_map_by_lat_lon.html"
    m.save(map_path)
    
    return map_path

@app.get("/get-artist-charts-data")
async def get_artist_charts_data(
    startYear: int = Query(..., description="The start year for filtering"),
    endYear: int = Query(..., description="The end year for filtering"),
    filter: str = Query(..., description="What to filter on")
):
    """
    Endpoint to fetch map data filtered by a year range.
    """
    # Call the `create_chart` function
    artist_chart_file = create_artist_charts(startYear, endYear, filter)
    return FileResponse(artist_chart_file, media_type="image/png", filename=os.path.basename(artist_chart_file))




def create_artist_charts(startYear, endYear, filter):

    category_colors = plt.colormaps['YlGn'](np.linspace(0.35, 0.85, 10))
    # Load the dataset
    df = pd.read_csv('data_cleaning_and_queries' + os.sep + 'artVis_data_cleaned.csv')

    # Filter for the specified years
    grouped_by = (df.loc[(df['e_startdate'] >= startYear) & (df['e_startdate'] <= endYear)]
                  .groupby(['a_id']).agg({'a_firstname': 'first',
                                          'a_lastname': 'first',
                                          'e_paintings': 'sum',
                                          'e_id': 'count',
                                          'e_venue': lambda x: x.nunique()
                                          }))

    if filter == 'paintings':
        df_top10 = grouped_by.sort_values(by='e_paintings', ascending=False).head(10).sort_values(by='e_paintings')
        df_top10["artist_name"] = df_top10["a_firstname"] + " " + df_top10["a_lastname"]
        # Create the bar chart
        plt.figure(figsize=(10, 6))
        bars = plt.barh(df_top10["artist_name"], df_top10["e_paintings"], color=category_colors, edgecolor="black")
        plt.xlabel("Number of Paintings exhibited", fontsize=16)

    elif (filter == 'exhibitions'):
        df_top10 = grouped_by.sort_values(by='e_id', ascending=False).head(10).sort_values(by='e_id')
        df_top10["artist_name"] = df_top10["a_firstname"] + " " + df_top10["a_lastname"]
        plt.figure(figsize=(10, 6))
        bars = plt.barh(df_top10["artist_name"], df_top10["e_id"], color=category_colors, edgecolor="black")
        plt.xlabel("Number of Exhibitions", fontsize=16)

    else:
        df_top10 = grouped_by.sort_values(by='e_venue', ascending=False).head(10).sort_values(by='e_venue')
        df_top10["artist_name"] = df_top10["a_firstname"] + " " + df_top10["a_lastname"]
        plt.figure(figsize=(10, 6))
        bars = plt.barh(df_top10["artist_name"], df_top10["e_venue"], color=category_colors, edgecolor="black")
        plt.xlabel("Number of Venues", fontsize=16)

    # Add the values next to each bar
    for bar in bars:
        # Get the width of each bar (the value) and position the text inside the bar
        plt.text(bar.get_width() / 2, bar.get_y() + bar.get_height() / 2,
                 f'{int(bar.get_width())}', va='center', ha='right', color='white', fontweight='bold')

    # Show the chart
    plt.tight_layout()  # Adjust layout to prevent clipping

    # Save the plot to a file (PNG)
    image_file = "artist_paintings_chart.png"
    plt.savefig(image_file, format="png")
    plt.close()

    return image_file


@app.get("/get-venue-charts-data")
async def get_venue_charts_data(
    startYear: int = Query(..., description="The start year for filtering"),
    endYear: int = Query(..., description="The end year for filtering"),
    filter: str = Query(..., description="What to filter on")
):
    """
    Endpoint to fetch map data filtered by a year range.
    """
    # Call the `create_chart` function
    venues_charts_file = create_venue_charts(startYear, endYear, filter)
    return FileResponse(venues_charts_file, media_type="image/png", filename=os.path.basename(venues_charts_file))
    
def create_venue_charts(startYear, endYear, filter):
    colors = plt.colormaps['YlOrBr'](np.linspace(0.15, 0.85, 10))
    # Load the dataset
    df = pd.read_csv('data_cleaning_and_queries' + os.sep + 'artVis_data_cleaned.csv')
    # Filter for the specified years
    grouped_by = (df.loc[(df['e_startdate'] >= startYear) & (df['e_startdate'] <= endYear)]
                  .groupby(['e_venue']).agg({'e_country': 'first',
                                             'e_city': 'first',
                                             'e_paintings': 'sum',
                                             'e_id': lambda x: x.nunique(),
                                             'a_id': lambda x: x.nunique()}).reset_index())

    if(filter == 'paintings'):
        df_top10 = grouped_by.sort_values(by='e_paintings', ascending=False).head(10).sort_values(by='e_paintings')
        plt.figure(figsize=(10, 6))  # Set the figure size
        bars = plt.barh(df_top10["e_venue"], df_top10["e_paintings"], color=colors, edgecolor="black")
        plt.xlabel("Number of Paintings", fontsize=16)

    elif(filter == 'exhibitions'):
        df_top10 = grouped_by.sort_values(by='e_id', ascending=False).head(10).sort_values(by='e_id')
        plt.figure(figsize=(10, 6))  # Set the figure size
        bars = plt.barh(df_top10["e_venue"], df_top10["e_id"], color=colors, edgecolor="black")
        plt.xlabel("Number of Exhibitions", fontsize=16)
        #plt.title("Number of Exhibitions by Artist")

    else: # artists
        df_top10 = grouped_by.sort_values(by='a_id', ascending=False).head(10).sort_values(by='a_id')
        plt.figure(figsize=(10, 6))  # Set the figure size
        bars = plt.barh(df_top10["e_venue"], df_top10["a_id"], color=colors, edgecolor="black")
        plt.xlabel("Number of Venues", fontsize=16)
        #plt.title("Number of Venues by Artist")

        
    for bar in bars:
    # Get the width of each bar (the value) and position the text inside the bar
        plt.text(bar.get_width() / 2, bar.get_y() + bar.get_height() / 2,
                f'{int(bar.get_width())}', va='center', ha='right', color='white', fontweight='bold')

    # Show the chart
    plt.tight_layout()  # Adjust layout to prevent clipping
    
    # Save the plot to a file (PNG)
    image_file = "artist_paintings_chart.png"
    plt.savefig(image_file, format="png")
    plt.close()
    
    return image_file
