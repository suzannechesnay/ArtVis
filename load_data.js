// const fs = require('fs');
// const Papa = require('papaparse');
import fs from 'fs'
import Papa from 'papaparse';

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      const results = Papa.parse(data, {header: true});
      resolve(results.data);
      // console.log(filePath, results);

    });
  });
}

export async function loadData() {
  const data = await loadCSV('./data/artVis_data_cleaned.csv')
  // artist_id,artist_firstname, ... ,e_id,e_title,e_venue,e_startdate,e_type,nb_paintings_by_artist_at_e,...
  const exhibitions = await loadCSV('./data/europe_data_exhibitions.csv');
  // e_id,e_title,e_venue,e_startdate,e_type,e_country,e_city,e_latitude,e_longitude
  const artists = await loadCSV('./data/europe_data_artists.csv');
  // artist_id,artist_firstname,artist_lastname,...,artist_nationality
  const venues = await loadCSV('./data/europe_data_venues.csv');
  // venue_id,venue_name
  return { data, exhibitions, artists, venues };
}


// async function validateAndLinkData() {
//    const {data, exhibitions, artists, venues} = await loadData();
    // console.log('Data:', data);
    // console.log('Exhibitions:', exhibitions)
    // console.log('Artists:', artists);
    // console.log('Venues:', venues);
    // Map venues and artists by ID for quick lookup
    // const exhibitionMap = Object.fromEntries(exhibitions.map(exhibition => [e_id, exhibition]));
//    const exhibitionMap = exhibitions && Array.isArray(exhibitions)
//        ? Object.fromEntries(exhibitions.map(exhibition => [exhibition.e_id, exhibition]))
//        : {};
//    const artistMap = artists && Array.isArray(artists)
//        ? Object.fromEntries(artists.map(artist => [artist.artist_id, artist]))
//        : {};
//    const venueMap = venues && Array.isArray(venues)
//        ? Object.fromEntries(venues.map(venue => [venue.venue_id, venue]))
//        : {};
    // Link exhibitions with corresponding venues and artists
//    const dataRows = data && Array.isArray(data)
//        ? data.map(row => ({
//            ...row,
//            exhibitionDetails: exhibitionMap[row.e_id] || null,
//            artistDetails: artistMap[row.artist_id] || null,
//            venueDetails: venueMap[row.e_venue] || null,
//        }))
//        : [];
//    return {data: dataRows, exhibitions, artists, venues};
//}


// to test function:
// const e = await loadData()
// console.log('validateAndLinkDate returns:', e.artists);


// module.exports = { loadData };
