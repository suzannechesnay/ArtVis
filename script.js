let exhibitions = [];
let artists = [];
let venues = [];
let timeRange = [1905, 1915];
let map;
let currentArtistFilter = 'paintings';
let currentVenueFilter = 'artists';


function initTimeSlider() {
  const timeSlider = document.getElementById('timeSlider');

  noUiSlider.create(timeSlider, {
    start: [1905, 1915],
    connect: true,
    range: {
      min: 1905,
      max: 1915
    },
    step: 1,
    tooltips: [
      {
        to: (value) => Math.round(value),
        from: (value) => Number(value)
      },
      {
        to: (value) => Math.round(value),
        from: (value) => Number(value)
      }
    ],
    pips: {
      mode: 'steps',
      density: 10,
      format: {
        to: (value) => Math.round(value),
        from: (value) => Number(value)
      }
    }
  });

  // Event listener to get the selected range values
  timeSlider.noUiSlider.on('update', (values) => {
  const [startYear, endYear] = values.map((value) => Math.round(value));
  console.log(`Selected range: ${startYear} - ${endYear}`);
  
  // Update the global timeRange variable and fetch new map data
  timeRange = [startYear, endYear];
  updateMapSource();
  updateCharts();
  });
}

function updateButtons(clickedButton) {
  // Find the parent button group of the clicked button
  const btnGroup = clickedButton.closest('.btn-group');

  // Remove 'active' class from all buttons in this button group
  const buttons = btnGroup.querySelectorAll('.btn');
  buttons.forEach(button => button.classList.remove('active'));

  // Add 'active' class to the clicked button
  clickedButton.classList.add('active');
}

async function updateArtistChart(filter, clickedButton) {
  if (clickedButton) {
    updateButtons(clickedButton)
  }

  currentArtistFilter = filter
  const baseURL = "http://localhost:8000/get-artist-charts-data";
  const mapURL = `${baseURL}?startYear=${timeRange[0]}&endYear=${timeRange[1]}&filter=${filter}`;

  // Set the img src attribute
  document.getElementById("artistChart").src = mapURL;
}

async function updateVenueChart(filter, clickedButton) {
  if (clickedButton) {
    updateButtons(clickedButton)
  }
  
  currentVenueFilter = filter
  const baseURL = "http://localhost:8000/get-venue-charts-data";
  const mapURL = `${baseURL}?startYear=${timeRange[0]}&endYear=${timeRange[1]}&filter=${filter}`;

  // Set the img src attribute
  document.getElementById("venueChart").src = mapURL;
}




function updateMapSource() {
  const baseURL = "http://localhost:8000/get-map-data";
  const mapURL = `${baseURL}?startYear=${timeRange[0]}&endYear=${timeRange[1]}`;

  // Set the iframe src attribute
  document.getElementById("map-frame").src = mapURL;
}

async function fetchMapData(startYear, endYear) {
  try {
    // Send the selected year range to the API
    const response = await fetch(`http://127.0.0.1:8000/get-map-data?startYear=${startYear}&endYear=${endYear}`);

    if (!response.ok) {
      throw new Error('Failed to fetch map data');
    }

    const blob = await response.blob(); // Get the map HTML as a blob
    const mapUrl = URL.createObjectURL(blob); // Create a URL for the blob

    // Find the iframe element to update the map
    const mapFrame = document.getElementById("map-frame");
    mapFrame.src = mapUrl; // Set the iframe src to the new map
  } catch (error) {
    console.error('Error fetching map data:', error);
  }
}


function updateVisualization() {
  updateHeatmap();
  updateCharts();
}

function updateCharts() {
  updateArtistChart(currentArtistFilter);
  updateVenueChart(currentVenueFilter);
}

async function init() {
  initTimeSlider();
}

init();
