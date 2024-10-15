const apiKey = '47f3ad18870adefc1fd086cb168886d5';
// Define the coordinates of Madrid BY DEFAULT
let latitude =  40.4165;
let longitude = -3.7026;

const { createApp } = Vue;
  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app');



// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    const userInput = document.getElementById('userInput').value;
    const errorMessage = document.getElementById('errorMessage');
    const displayInput = document.getElementById('displayInput');

    if (userInput.trim() === "") {
        errorMessage.innerText = "Input cannot be empty.";
        displayInput.innerText = "";
        return;
    }
    errorMessage.innerText = "";

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=${apiKey}&units=metric`;

    // Fetch data from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Process and display the data
            latitude = data.coord.lat;
            longitude = data.coord.lon;
            let temperature = Math.round(data.main.temp);
            let state = auxDisplay(temperature);
            
            displayInput.innerHTML = `Weather in ${data.name} is: ${state}, Temperature: ${temperature} ºC, 
            Humidity: ${data.main.humidity}%, 
            Wind Speed: ${data.wind.speed} m/s, 
            Latitude: ${data.coord.lat}, Longitude: ${data.coord.lon}, Country: ${data.sys.country},
            Weather Icon: <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png">`;
        })
        .catch(error => {
            errorMessage.innerText = `Error: ${error.message}`;
        });
}

// Function to handle "Today" button click
function handleTodayButtonClick() {
    const displayInput = document.getElementById('displayInput');
    const errorMessage = document.getElementById('errorMessage');

    /*if (latitude === null || longitude === null) {
        errorMessage.innerText = "No location data available. Please search for a city first.";
        return;
    }*/
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    fetchWeather(apiUrl, displayInput, errorMessage);
}

async function fetchWeather(apiUrl, displayInput, errorMessage) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        if(latitude === 40.4165 && longitude === -3.7026) {
            city = 'Madrid';
        } else {
            city = data.name;
        }
        // Process and display the data
        displayInput.innerHTML = data.list.map(item => {
            const date = new Date(item.dt * 1000);

            return `<div>
                <p>${date.toLocaleString()}</p>
                <p>Temperature: ${Math.round(item.main.temp)} °C</p>
                <p>Weather: ${item.weather[0].description}</p>
                <p>Humidity: ${item.main.humidity}%</p>
                <p>Wind Speed: ${item.wind.speed} m/s</p>
                <p>Pressure: ${item.main.pressure} hPa</p>
                <p>Weather Icon: <img src="http://openweathermap.org/img/w/${item.weather[0].icon}.png"></p>
            </div>`;
        }).join('');
    } catch (error) {
        errorMessage.innerText = `Error: ${error.message}`;
    }
}

function auxDisplay(temp) {
    console.log(temp);
    let aux = Number(temp);

    if (aux < 8.0) {
        return 'Cold';
    } else if (aux >= 8.0 && aux <= 24.0) {
        return 'Mild';
    } else if (aux > 24.0) {
        return 'Hot';
    }
}

// Attach event listeners
document.getElementById('userForm').addEventListener('keypress', function(event) {
    if(event.key == 'Enter') {
        handleFormSubmit(event);
    }
});

document.querySelector('button').addEventListener('click', handleTodayButtonClick);