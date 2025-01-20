import exhibitions from "../data/exhibition_data.js";

let currentVenueChart = null;

const baseChartOptions = {
  indexAxis: "y",
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
};

const getChartOptions = (chartType) => {
  const options = { ...baseChartOptions };

  if (chartType === "paintings") {
    options.scales = {
      x: {
        type: "linear",
        max: 1500,
        min: 0,
        ticks: {
          stepSize: 50,
        },
      },
      y: {
        type: "category",
        ticks: {
          stepSize: 1,
        },
      },
    };
  } else {
    options.scales = {
      x: {
        type: "linear",
        max: 35,
        min: 0,
        ticks: {
          stepSize: 5,
        },
      },
      y: {
        type: "category",
        ticks: {
          stepSize: 5,
        },
      },
    };
  }

  return options;
};

const chartColors = {
  artists: "rgba(255, 99, 132, 0.2)",
  paintings: "rgba(54, 162, 235, 0.2)",
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

(async function () {
  const data = exhibitions;

  const getTopVenuesByNbOfArtists = () => {
    return Object.values(
        data.reduce((acc, curr) => {
          if (!acc[curr.e_venue]) {
          acc[curr.e_venue] = {
            e_venue: curr.e_venue,
            artists: new Set([curr.a_id]),
            // paintings: curr.e_paintings,
          };
        } else {
          acc[curr.e_venue].artists.add(curr.a_id);
          // acc[curr.e_venue].paintings += curr.e_paintings;
        }
        return acc;
      }, {})
    )
      .map((venue) => ({
        ...venue,
        artistCount: venue.artists.size,
      }))
      .sort((a, b) => b.artistCount - a.artistCount)
      .slice(0, 10);
  };

  const getTopVenuesByPaintings = () => {
    return Object.values(
      data.reduce((acc, curr) => {
        if (!acc[curr.e_venue]) {
          acc[curr.e_venue] = {
            e_venue: curr.e_venue,
            artists: new Set([curr.a_id]),
            paintings: curr.e_paintings,
          };
        } else {
          acc[curr.e_venue].artists.add(curr.a_id);
          acc[curr.e_venue].paintings += curr.e_paintings;
        }
        return acc;
      }, {})
    )
      .sort((a, b) => b.paintings - a.paintings)
      .slice(0, 10);
  };

  const getTopVenuesByNbOfExhibitions = () => {
    return Object.values(
      data.reduce((acc, curr) => {
        if (!acc[curr.e_venue]) {
          acc[curr.e_venue] = {
            e_venue: curr.e_venue,
            exhibitions: 1,
            artists: new Set([curr.a_id]),
            paintings: curr.e_paintings,
          };
        } else {
          acc[curr.e_venue].exhibitions++;
          acc[curr.e_venue].artists.add(curr.a_id);
          acc[curr.e_venue].paintings += curr.e_paintings;
        }
        return acc;
      }, {})
    )
      .sort((a, b) => b.exhibitions - a.exhibitions)
      .slice(0, 10);
  };

  const createChartData = (chartType) => {
    let topVenues;
    let dataKey;
    let label;

    switch (chartType) {
      case "artists":
        topVenues = getTopVenuesByNbOfArtists();
        dataKey = "artistCount";
        label = "Number of Artists";
        break;
      case "paintings":
        topVenues = getTopVenuesByPaintings();
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
      data: createChartData(chartType),
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
