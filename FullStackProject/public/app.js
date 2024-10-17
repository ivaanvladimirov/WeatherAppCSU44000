const apiKey = '47f3ad18870adefc1fd086cb168886d5';

new Vue({
    el: '#app',
    data: {
        city: '',
        errorMessage: '',
        displayInput: '',
        weatherData: null,
        forecastData: null,
        forecastWeatherData: null, // Nueva propiedad para manejar el clima del pronóstico
        description: '',
        userCoordinates: null
    },
    methods: {

        auxDisplay(temp) {
            
            if (temp < 8.0) {
                return 'Cold';
            } else if (temp >= 8.0 && temp <= 24.0) {
                return 'Mild';
            } else if (temp > 24.0) {
                return 'Hot';
            }
        },

        async handleFormSubmit() {
            if (this.city.trim() === "") {
                this.errorMessage = "Input cannot be empty.";
                this.displayInput = "";
                return;
            }
            this.errorMessage = "";

            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apiKey}&units=metric`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                this.weatherData = data;
                this.description = this.auxDisplay(data.main.temp);
                
                this.displayInput = `You entered: ${this.city}`;
            } catch (error) {
                this.errorMessage = `Error: ${error.message}`;
            }
        },
        async handle3DaysButtonClick() {
            if (this.city.trim() === "") {
                this.errorMessage = "Input cannot be empty.";
                this.displayInput = "";
                return;
            }
            this.errorMessage = "";
        
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${apiKey}&units=metric`;
        
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                const groupedData = {};
                
                data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0];  // Extrae solo la fecha
                    console.log(item.weather[0]);
                    if (!groupedData[date]) {
                        groupedData[date] = {
                            temps: [],
                            weather: item.weather[0],  // Guarda el primer clima del día
                            rainChance: item.pop * 100  // Probabilidad de lluvia (como porcentaje)
                        };
                    }
                    
                    groupedData[date].temps.push(item.main.temp);  // Guarda las temperaturas del día
                });
        
                // Transforma los datos agrupados en un array con la información requerida
                this.forecastData = Object.keys(groupedData).slice(0, 3).map(date => {
                    const temps = groupedData[date].temps;
                    let maxTemp = Math.round(Math.max(...temps));
                    let minTemp = Math.round(Math.min(...temps));
                    let averageTemp = maxTemp + minTemp / 2;
                    return {
                        date: date,
                        maxTemp: maxTemp,
                        minTemp: minTemp,
                        weatherDescription: this.auxDisplay(averageTemp),  // Usa auxDisplay con la temperatura máxima
                        rainChance: groupedData[date].rainChance
                    };
                });
                this.forecastWeatherData = { temp: this.forecastData[0].maxTemp }; // Actualizamos forecastWeatherData
                this.displayInput = `3-Day Forecast for: ${this.city}`;
            } catch (error) {
                this.errorMessage = `Error: ${error.message}`;
            }
        }   ,
        handleTodayButtonClick() {
            this.handleFormSubmit();
        },
        handleAirQualityButtonClick() {
            // Implement the logic for fetching and displaying air quality data
        },
        handleNewFeatButtonClick() {
            // Implement the logic for fetching and displaying landscape & tourism data
        },
        handleInfoButtonClick() {
            // Implement the logic for displaying information about the app
        },
        
        getWeatherIcon(iconCode) {
            return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        },
        getUserCoordinates() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    this.userCoordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('User coordinates:', this.userCoordinates);
                    this.displayMap();
                }, error => {
                    this.errorMessage = `Error getting location: ${error.message}`;
                });
            } else {
                this.errorMessage = "Geolocation is not supported by this browser.";
            }
        },
        displayMap() {
            if (this.userCoordinates) {
                const map = L.map('map').setView([this.userCoordinates.latitude, this.userCoordinates.longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                L.marker([this.userCoordinates.latitude, this.userCoordinates.longitude]).addTo(map)
                    .bindPopup('You are here.')
                    .openPopup();
            }
        }
        
        
    },
    computed: {
        backgroundColor() {
            if (this.weatherData && this.weatherData.main) {
                const temp = this.weatherData.main.temp || this.forecastWeatherData.temp;

                if (temp > 24) {
                    return '#FF5733'; // Hot - Red
                } else if (temp >= 8 && temp <= 24) {
                    return '#FFE797'; // Warm - Yellow
                } else if (temp < 8) {
                    return '#3498DB'; // Cool - Light Green
                } 
            }
            return '#FFFFFF'; // Default - White
        }
    },
    mounted() {
        this.getUserCoordinates();
    }
});