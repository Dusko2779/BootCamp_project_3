// Variable to store the loaded data
let data;

// Initialize an array to store the markers
let markers = [];

// Function to load data from a JSON file
async function loadData() {
  try {
    const dataURL = "https://raw.githubusercontent.com/Dusko2779/Project_3_cleaned_data/main/cleaned_data.json";
    const response = await fetch(dataURL);
    if (!response.ok) {
      throw new Error("Failed to load data");
    }
    data = await response.json();

    // Populate the dropdown with unique topics
    populateTopicDropdown(data);

    // Initialize the chart with the first topic
    const defaultTopic = data[0].topic;
    updateColumnChart(defaultTopic);
    createPieChartWithAverage(defaultTopic, "top10PieChart", true);
    createPieChartWithAverage(defaultTopic, "bottom10PieChart", false);

    // Initialize the map
    initializeChoroplethMap();

    // Add markers for each country
    addMarkersForCountriesForTopic(defaultTopic);

  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// Function to populate the dropdown with unique topics
function populateTopicDropdown(data) {
  const topicSelect = document.getElementById("topicSelect");
  const uniqueTopics = [...new Set(data.map((item) => item.topic))];

  // Clear any existing options in the dropdown
  topicSelect.innerHTML = "";

  // Create an option for each unique topic
  uniqueTopics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.text = topic;
    topicSelect.appendChild(option);
  });
}

// Function to update the column chart based on the selected topic
function updateColumnChart(selectedTopic) {
  // Filter the data based on the selected topic
  const filteredData = data.filter((item) => item.topic === selectedTopic);

  // Group the filtered data by year and count the number of countries for each year
  const yearCounts = {};
  filteredData.forEach((item) => {
    const year = item.year;
    if (yearCounts[year]) {
      yearCounts[year]++;
    } else {
      yearCounts[year] = 1;
    }
  });

  // Create an array of objects with year and count
  const yearCountsArray = Object.keys(yearCounts).map((year) => ({
    year: year,
    count: yearCounts[year],
  }));

  // Sort the array in descending order by count
  yearCountsArray.sort((a, b) => b.count - a.count);

  // Extract sorted years and counts
  const sortedYears = yearCountsArray.map((item) => item.year);
  const counts = yearCountsArray.map((item) => item.count);

  // Define colors for each year, with a darker yellow for 2022
  const colors = {
    "2020": "red",
    "2021": "blue",
    "2022": "green",
  };

  // Create the trace for the column chart
  const trace = {
    x: sortedYears,
    y: counts,
    type: "bar",
    marker: {
      color: sortedYears.map((year) => colors[year]),
    },
  };

  const layout = {
    title: `Number of Countries Searching for Topic: ${selectedTopic} Each Year`,
    xaxis: { title: "Year", tickvals: sortedYears },
    yaxis: { title: "Number of Countries" },
  };

  // Create or update the column chart in the "barChart" div
  Plotly.react("barChart", [trace], layout);
}

// Function to create a pie chart with the average index_trend over three years for top or bottom 10
function createPieChartWithAverage(selectedTopic, chartId, isTop10) {
  // Filter the data based on the selected topic
  const filteredData = data.filter((item) => item.topic === selectedTopic);

  // Sort the data in descending order if it's for the top 10, or ascending for the bottom 10
  filteredData.sort((a, b) => (isTop10 ? b.index_trends - a.index_trends : a.index_trends - b.index_trends));

  // Select the top or bottom 10 items
  const topOrBottomData = filteredData.slice(0, 10);

  // Extract country names and index_trends values
  const countryNames = topOrBottomData.map((item) => item.country);
  const indexTrendsValues = topOrBottomData.map((item) => item.index_trends);

  // Calculate the average index_trend
  const averageIndexTrend = indexTrendsValues.reduce((total, value) => total + parseFloat(value), 0) / indexTrendsValues.length;

  // Create an array of labels with both country names and the average value
  const labels = [...countryNames, `Average: ${averageIndexTrend.toFixed(2)}`];

  // Create an array of values with both index_trends values and the average value
  const values = [...indexTrendsValues, averageIndexTrend];

  // Create the trace for the hollow pie chart
  const trace = {
    labels: labels,
    values: values,
    type: "pie",
    hole: 0.3,
    textinfo: "none",
    hoverinfo: "label+value",
  };

  const layout = {
    title: `${isTop10 ? "Top 10" : "Bottom 10"} Countries by Average Index Trends for Topic: ${selectedTopic}`,
  };

  // Create or update the hollow pie chart in the specified chart div
  Plotly.react(chartId, [trace], layout);
}

// Function to initialize the Choropleth Map
function initializeChoroplethMap() {
  // Load the data for the Choropleth Map
  d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/2010_alcohol_consumption_by_country.csv', function(err, rows) {
    function unpack(rows, key) {
      return rows.map(function(row) { return row[key]; });
    }

    var data = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: unpack(rows, 'location'),
      z: unpack(rows, 'alcohol'),
      text: unpack(rows, 'location'),
      autocolorscale: true
    }];

    var layout = {
      title: 'Pure alcohol consumption<br>among adults (age 15+) in 2010',
      geo: {
        projection: {
          type: 'robinson'
        }
      }
    };

    // Create the Choropleth Map using Plotly
    Plotly.newPlot("choroplethMap", data, layout, {showLink: false});
  });
}

// Function to add markers for each country for the selected topic
function addMarkersForCountriesForTopic(selectedTopic) {
  // Clear existing markers from the map
  markers.forEach((marker) => map.removeLayer(marker));

  // Filter and add markers for the selected topic
  data.forEach((item) => {
    const country = item.country;
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);

    if (!isNaN(lat) && !isNaN(lng) && item.topic === selectedTopic) {
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`Country: ${country}<br>Topic: ${item.topic}<br>Index Trends: ${item.index_trends}`);
      markers.push(marker);
    }
  });
}

// Event listener for topic dropdown change
document.getElementById("topicSelect").addEventListener("change", function () {
  const selectedTopic = this.value;
  updateColumnChart(selectedTopic);
  createPieChartWithAverage(selectedTopic, "top10PieChart", true);
  createPieChartWithAverage(selectedTopic, "bottom10PieChart", false);
  addMarkersForCountriesForTopic(selectedTopic); // Update markers for the selected topic
});

// Initialize the dashboard
loadData().catch((error) => {
  console.error("Error initializing dashboard:", error);
});











