// Function to load data from a JSON file
async function loadData() {
  try {
      const response = await fetch('cleaned_data.json'); // Relative URL to the JSON file
      if (!response.ok) {
          throw new Error('Failed to load data');
      }
      return response.json();
  } catch (error) {
      console.error('Error loading data:', error);
  }
}

// Function to populate the dropdown with unique topics
function populateTopicDropdown(data) {
  const topicSelect = document.getElementById("topicSelect");
  const uniqueTopics = [...new Set(data.map(item => item.topic))];

  // Clear any existing options in the dropdown
  topicSelect.innerHTML = "";

  // Create an option for each unique topic
  uniqueTopics.forEach(topic => {
      const option = document.createElement("option");
      option.value = topic;
      option.text = topic;
      topicSelect.appendChild(option);
  });
}

// Function to update the bar chart based on selected topic
function updateBarChart(selectedTopic, data) {
  // Use D3.js to create the bar chart here with the filtered data based on the selected topic
}

// Function to update the Leaflet map
function updateMap(data) {
  // Use Leaflet to create the map with country borders and index trends here
}

// Event listener for topic dropdown change
document.getElementById("topicSelect").addEventListener("change", function () {
  const selectedTopic = this.value;
  updateBarChart(selectedTopic, data);
});

// Initialize the dashboard
loadData()
  .then(data => {
      populateTopicDropdown(data);
      updateBarChart(data[0].topic, data); // Initialize with the first topic
      updateMap(data);
  })
  .catch(error => {
      console.error('Error initializing dashboard:', error);
  });


