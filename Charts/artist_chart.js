import exhibitions from "../data/exhibition_data.js";

let currentArtistChart = null;

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
        max: 1000,
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
        max: 20,
        min: 1,
        ticks: {
          stepSize: 2,
        },
      },
      y: {
        type: "category",
        ticks: {
          stepSize: 2,
        },
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

(async function () {
  const data = exhibitions;

  const getTopArtistsByPaintings = () => {
    return data
      .reduce((acc, curr) => {
        const artist = acc.find((a) => a.a_id === curr.a_id);
        if (artist) {
          artist.e_paintings += curr.e_paintings;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, [])
      .sort((a, b) => b.e_paintings - a.e_paintings)
      .slice(0, 10);
  };

  const getTopArtistsByExhibitions = () => {
    return Object.values(
      data.reduce((acc, curr) => {
        if (!acc[curr.a_id]) {
          acc[curr.a_id] = {
            a_id: curr.a_id,
            a_firstname: curr.a_firstname,
            a_lastname: curr.a_lastname,
            exhibitions: 1,
          };
        } else {
          acc[curr.a_id].exhibitions++;
        }
        return acc;
      }, {})
    )
      .sort((a, b) => b.exhibitions - a.exhibitions)
      .slice(0, 10);
  };

  const getTopArtistsByVenues = () => {
    return Object.values(
      data.reduce((acc, curr) => {
        if (!acc[curr.a_id]) {
          acc[curr.a_id] = {
            a_id: curr.a_id,
            a_firstname: curr.a_firstname,
            a_lastname: curr.a_lastname,
            venues: new Set([curr.e_venue]),
          };
        } else {
          acc[curr.a_id].venues.add(curr.e_venue);
        }
        return acc;
      }, {})
    )
      .map((artist) => ({
        ...artist,
        venueCount: artist.venues.size,
      }))
      .sort((a, b) => b.venueCount - a.venueCount)
      .slice(0, 10);
  };

  const createChartData = (chartType) => {
    let topArtists;
    let dataKey;
    let label;

    switch (chartType) {
      case "paintings":
        topArtists = getTopArtistsByPaintings();
        dataKey = "e_paintings";
        label = "Nombre de Peintures";
        break;
      case "exhibitions":
        topArtists = getTopArtistsByExhibitions();
        dataKey = "exhibitions";
        label = "Nombre d'Expositions";
        break;
      case "venues":
        topArtists = getTopArtistsByVenues();
        dataKey = "venueCount";
        label = "Nombre de Lieux";
        break;
    }

    return {
      labels: topArtists.map(
        (artist) => `${artist.a_firstname} ${artist.a_lastname}`
      ),
      datasets: [
        {
          label: `Top 10 Artistes par ${label}`,
          data: topArtists.map((artist) => artist[dataKey]),
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  window.updateArtistChart = function (chartType) {
    if (currentArtistChart) {
      currentArtistChart.destroy();
    }

    const ctx = document.getElementById("artistChart");
    currentArtistChart = new Chart(ctx, {
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

  updateArtistChart("paintings");
})();
