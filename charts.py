from fastapi import FastAPI, Query
import pandas as pd
import os
from fastapi.responses import JSONResponse, FileResponse

app = FastAPI()

@app.get("/get-charts-data")
async def get_charts_data(
    startYear: int = Query(..., description="The start year for filtering"),
    endYear: int = Query(..., description="The end year for filtering"),
):
    """
    Endpoint to fetch charts data filtered by a year range.
    """
    # Call the `create_chart` function
    charts_file = create_charts(startYear, endYear)
    charts_url = f"/static/maps/{os.path.basename(charts_file)}"

    # Return the URL to the charts (no need for the file response)
    return JSONResponse(content={"charts_url": charts_url})
    
    # Return the map file as a response
    #return FileResponse(map_file, media_type="text/html", filename=os.path.basename(map_file))

    
def create_charts(startdate, enddate):
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

    json_files = [grouped_by_artist.to_json(orient='records')]


    # Save the dataframes as an HTML file
    charts_url = "exhibition_map_by_lat_lon.html"
    # TO DO: export the 2 dataframes as json to use them in charts.js

    return json_files