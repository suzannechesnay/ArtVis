from fastapi import FastAPI, Query
import pandas as pd
import os
import folium
from fastapi.responses import JSONResponse, FileResponse

app = FastAPI()

@app.get("/get-charts-data")
async def get_charts_data(
    startYear: int = Query(..., description="The start year for filtering"),
    endYear: int = Query(..., description="The end year for filtering"),
):
    """
    Endpoint to fetch map data filtered by a year range.
    """
    # Call the `create_chart` function
    charts_file = create_charts(startYear, endYear)
    return FileResponse(charts_file, media_type="text/html", filename=os.path.basename(charts_file), headers={"Content-Disposition": "inline"})
    
    #map_url = f"/static/maps/{os.path.basename(map_file)}"

    # Return the URL to the map (no need for the file response)
    #return JSONResponse(content={"map_url": map_url})
    
    # Return the map file as a response
    #return FileResponse(map_file, media_type="text/html", filename=os.path.basename(map_file))

    
def create_charts(startdate, enddate):
    # Load the dataset
    df = pd.read_csv('data_cleaning_and_queries' + os.sep + 'artVis_data_cleaned.csv')
    
    # Filter for the specified years
    filtered_df = df.loc[(df['e.startdate'] >= startdate) & (df['e_startdate'] <= enddate)]

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


    # TO DO: export the 2 dataframes as json (path = 'http://myurl/myfile.json') to use them in charts.js

    # Save the map as an HTML file

    return json_files