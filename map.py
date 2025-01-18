from fastapi import FastAPI, Query
import pandas as pd
import os
import folium
import json
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
    return FileResponse(map_file, media_type="text/html", filename=os.path.basename(map_file),
                        headers={"Content-Disposition": "inline"})

    #map_url = f"/static/maps/{os.path.basename(map_file)}"

    # Return the URL to the map (no need for the file response)
    #return JSONResponse(content={"map_url": map_url})

    # Return the map file as a response
    #return FileResponse(map_file, media_type="text/html", filename=os.path.basename(map_file))


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
                f"<span style='font-size: 16px;'>Exhibitions: {int(row['count'])}</span>",  # Custom font size
                sticky=True),
            stroke=False
        ).add_to(m)

    # Save the map as an HTML file
    map_path = "exhibition_map_by_lat_lon.html"
    m.save(map_path)

    return map_path


@app.get("/get-charts-data")
async def get_charts_data(
        startYear: int = Query(..., description="The start year for filtering"),
        endYear: int = Query(..., description="The end year for filtering"),
):
    json_array = create_charts_jsons(startYear, endYear)

    return JSONResponse(json_array)


def create_charts_jsons(startdate, enddate):
    # Load the dataset
    df = pd.read_csv('data_cleaning_and_queries' + os.sep + 'artVis_data_cleaned.csv')

    # Filter for the specified years
    filtered_df = df.loc[(df['e_startdate'] >= startdate) & (df['e_startdate'] <= enddate)]

    grouped_by_artist = filtered_df.groupby(['a_id']).agg({'a_firstname': 'first',
                                                           'a_lastname': 'first',
                                                           'e_paintings': 'sum',
                                                           'e_id': 'count',
                                                           'e_venue': lambda x: x.nunique()})

    grouped_by_venue = filtered_df.groupby(['e_venue']).agg({'e_country': 'first',
                                                             'e_city': 'first',
                                                             'a_id': lambda x: x.nunique(),
                                                             'e_id': lambda x: x.nunique(),
                                                             'e_paintings': 'sum'})

    charts_jsons = [json.dumps(grouped_by_artist.to_dict(orient="records")), json.dumps(grouped_by_venue.to_dict(orient="records"))]

    return charts_jsons
