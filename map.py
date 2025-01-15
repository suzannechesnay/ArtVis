from fastapi import FastAPI, Query
import pandas as pd
import os
import folium
from fastapi.responses import JSONResponse, FileResponse

app = FastAPI()

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
    
    #map_url = f"/static/maps/{os.path.basename(map_file)}"

    # Return the URL to the map (no need for the file response)
    #return JSONResponse(content={"map_url": map_url})
    
    # Return the map file as a response
    #return FileResponse(map_file, media_type="text/html", filename=os.path.basename(map_file))

    
def create_map(startdate, enddate):
    # Load the dataset
    df = pd.read_csv('data_cleaning_and_queries' + os.sep + 'artVis_data_cleaned.csv')
    
    # Filter for the specified years
    filtered_df = df.loc[(df['e.startdate'] >= startdate) & (df['e.startdate'] <= enddate)]

    # Group by latitude and longitude
    grouped = filtered_df.groupby(['e.latitude', 'e.longitude']).size().reset_index(name='count')

    # Create a base map
    m = folium.Map(location=[50, 10], zoom_start=4)

    # Add circle markers
    for _, row in grouped.iterrows():
        folium.CircleMarker(
            location=[row['e.latitude'], row['e.longitude']],
            radius=row['count'] / 100,
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