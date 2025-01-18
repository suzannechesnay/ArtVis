
let currentVenueChart = null;
let currentArtistChart = null;

const baseChartOptions = {
  indexAxis: "y",
  animation: false,
  plugins: {
    legend: { display: false, },
    tooltip: { enabled: true, },
  },
};

const getChartOptions = (chart, chartType) => {
  const options = { ...baseChartOptions };

  if (chartType === "by_painting_nb" || chart === 'artists') {
    options.scales = {
      x: {
        type: "linear",
        max: 500,
        min: 0,
        ticks: { stepSize: 50, },
      },
      y: {
        type: "category",
        ticks: { stepSize: 1, },
      },
    };
  } else {
    options.scales = {
      x: {
        type: "linear",
        max: 35,
        min: 0,
        ticks: { stepSize: 5, },
      },
      y: {
        type: "category",
        ticks: { stepSize: 5, },
      },
    };
  }
  return options;
};

const chartColors = {
  backgroundColor: [
    "rgba(115,228,21,0.87)",
    "rgba(54, 162, 235, 0.2)",
    "rgba(255, 206, 86, 0.2)",
    "rgba(75, 192, 192, 0.2)",
    "rgba(153, 102, 255, 0.2)",
    "rgba(255, 159, 64, 0.2)",
    "rgba(255, 99, 132, 0.2)",
    "rgba(54, 162, 235, 0.2)",
    "rgba(255, 206, 86, 0.2)",
    "rgba(75, 192, 192, 0.2)",
  ],
  borderColor: [
    "rgb(92,1,1)",
    "rgb(115,1,1)",
    "rgb(152,1,1)",
    "rgb(198,3,3)",
    "rgb(232,4,4)",
    "rgb(232,57,4)",
    "rgb(232,91,4)",
    "rgb(232,133,4)",
    "rgb(232,165,66)",
    "rgb(241,186,105)",
  ],
};

(async function updateCharts() {
  const data = await loadData();
  const getTop = (chart, chartType) => {
    return Object.values(
        data.reduce((acc, curr) => {
          if (chart === 'artists') { // chartNb === 1 -> ARTIST CHART
            if (chartType === 'by_painting_nb'){
              // Top Artists by nb of paintings:

            } else {
              if (chartType === 'by_exhibition_nb'){
                // Top Artists by nb of exhibitions:

              } else { // chartType === 'by_venue_nb':
                // Top Artists by nb of venues:

              }
            }
          } else { // chart === 'venues' -> VENUE CHART
            if (chartType === 'by_artist_nb'){
              // Top Venues by nb of artists:

            } else {
              if (chartType === 'by_exhibition_nb'){
                // Top Venues by nb of exhibitions:

              } else { // chartType === 'by_painting_nb':
                // Top Venues by nb of paintings:

              }
            }
          }


        return acc;
      }, {})
    )
      .map((object) => ({
        ...object,
        objectCount: object.size,
      }))
      .sort((a, b) => b.objectCount - a.objectCount)
      .slice(0, 10);
  };

  const createVenueChart = (chartType) => {
    let topVenues;
    let dataKey;
    let label;

    switch (chartType) {
      case ("artists"):
        topVenues = getTop('venues', 'artists');
        dataKey = "artistCount";
        label = "Number of Artists";
        break;
      case "paintings":
        topVenues = getTop('venues', 'paintings');
        dataKey = "paintings";
        label = "Number of Paintings";
        break;
      case "exhibitions":
        topVenues = getTopVenuesByNbOfExhibitions();
        dataKey = "exhibitions";
        label = "Number of Exhibitions";
        break;
    }

    return {
      labels: topVenues.map((venue) => venue.e_venue),
      datasets: [
        {
          label: `Top 10 Venues by ${label}`,
          data: topVenues.map((venue) => venue[dataKey]),
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.borderColor,
          borderWidth: 1,
        },
      ],
    };
  };




  window.updateVenueChart = function (chartType) {
    if (currentVenueChart) {
      currentVenueChart.destroy();
    }

    const ctx = document.getElementById("venueChart");
    currentVenueChart = new Chart(ctx, {
      type: "bar",
      options: getChartOptions(chartType),
      data: createVenueChart(chartType),
    });

    document.querySelectorAll(".btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.type === chartType) {
        btn.classList.add("active");
      }
    });
  };

  updateVenueChart("artists");
})();
