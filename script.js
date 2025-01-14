
      let heatmapData = [];
      let exhibitions = [];
      let artists = [];
      let venues = [];
      let timeRange = [1905, 1915];
      let map;

      function initMap() {
        map = L.map("map").setView([48.8566, 2.3522], 4);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          map
        );
      }

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
        });
      }

      async function loadData() {
        const [exhibitions, artists] = await Promise.all([
          axios.get("../data/exhibition_data.js"),
        ]);

        processData(exhibitions.data);
      }

      function processData(e) {
        venues = rawVenues.map((e) => ({
          e_id: e_id,
          e_title: e_title,
          venue: e_venue,
          paintings: e_paintings,
          artistId: a_id,
        }));

        exhibitions = rawExhibitions.map((e) => ({
          id: e_id,
          title: e_title,
          venue: e_venue,
          startDate: new Date(e_startDate),
          type: e_type,
          paintings: e_paintings,
          country: e_country,
          city: e_city,
          lat: e_latitude,
          lng: e_longitude,
          artistId: a_id,
        }));

        const ExhibitionsMap = new Map(
          exhibitions.map((e) => [e_id, exhibition])
        );

        exhibitions.forEach((e) => {
          const exhibition = ExhibitionsMap.get(artistId);
          if (artistsMap.has(exhibition.a_id)) {
            artist.totalPaintings += exhibition.e_paintings;
            artist.exhibitions.add(exhibition.e_id);
            artist.venues.add(exhibition.e_venue);
          }
        });

        createHeatmapData();
        updateVisualization();
      }

      loadData();


      function createHeatmapData() {
        const venueMap = new Map();

        exhibitions.forEach((exhibition) => {
          const key = `${exhibition.venue}`;
          if (!venueMap.has(key)) {
            venueMap.set(key, {
              lat: exhibition.lat,
              lng: exhibition.lng,
              count: 0,
            });
          }
          venueMap.get(key).count++;
        });

        heatmapData = Array.from(venueMap.values());
      }

      function updateVisualization() {
        updateHeatmap();
        updateCharts();
      }

      function updateHeatmap() {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker || layer.options.heatmap) {
            map.removeLayer(layer);
          }
        });

        const filteredData = exhibitions.filter(
          (e) =>
            e.startDate.getFullYear() >= timeRange[0] &&
            e.startDate.getFullYear() <= timeRange[1]
        );

        const venueMap = new Map();
        filteredData.forEach((exhibition) => {
          const key = `${exhibition.venue}`;
          if (!venueMap.has(key)) {
            venueMap.set(key, {
              venue: exhibition.venue,
              lat: exhibition.lat,
              lng: exhibition.lng,
              exhibitions: [],
            });
          }
          venueMap.get(key).exhibitions.push(exhibition);
        });

        venueMap.forEach((venue) => {
          const marker = L.marker([venue.lat, venue.lng])
            .bindPopup(createPopupContent(venue))
            .addTo(map);
        });
      }

      function createPopupContent(venue) {
        return `
                        <div class="popup">
                            <h3>${venue.venue}</h3>
                            <p>Total Exhibitions: ${
                              venue.exhibitions.length
                            }</p>
                            <ul>
                                ${venue.exhibitions
                                  .map(
                                    (e) => `
                                    <li>
                                        ${e.title}<br>
                                        Date: ${e.startDate.toLocaleDateString()}<br>
                                        Type: ${e.type}<br>
                                        Paintings: ${e.paintings}
                                    </li>
                                `
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `;
      }

      function updateCharts() {
        updateArtistChart();
        updateVenueChart();
      }

      async function init() {
        initMap();
        initTimeSlider();
      }

      init();
