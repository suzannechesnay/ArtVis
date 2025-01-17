
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

const getChartOptions = (chartNb, chartType) => {
  const options = { ...baseChartOptions };

  if (chartType === "paintings" || chartNb === 1) {
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
    "rgba(255, 99, 132, 0.2)",
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
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
  ],
};

(async function updateCharts() {
  const data = await loadData();
  const getTop = (chartNb, chartType) => {
    return Object.values(
        data.reduce((acc, curr) => {
          if (chartNb === 1) { // chartNb === 1 -> ARTIST CHART
            if (chartType === 'paintings'){
              // Top Artists by nb of paintings:

            } else {
              if (chartType === 'exhibitions'){
                // Top Artists by nb of exhibitions:

              } else { // chartType === 'venues':
                // Top Artists by nb of venues:

              }
            }
          } else { // chartNb === 2 -> VENUE CHART
            if (chartType === 'artists'){
              // Top Venues by nb of artists:

            } else {
              if (chartType === 'exhibitions'){
                // Top Venues by nb of exhibitions:

              } else { // chartType === 'paintings':
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
})();

