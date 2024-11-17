const apiKey = '47f3ad18870adefc1fd086cb168886d5';
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

new Vue({
    el: '#app',
    data: {
        city: '',
        errorMessage: '',
        displayInput: '',
        weatherData: null,
        forecastData: null,
        airData: null,
        forecastWeatherData: null, 
        description: '',
        userCoordinates: null,
        formattedDate: '',
        formattedDateToday : '',
        loading: false,
        cityName: '',
        countryName: '',
        latitudeProperty: '',
        longitudeProperty: '',
        co: '',
        co2: '',
        no2: '',
        o3: '',
        pm2_5: '',
        pm10: '',
        so2: '',
        nh3: '',
        airquality: '',
        activated3days : false,
        activatedAirQuality : false


    },
    methods: {

        getCauseOfLowerAQI() {
            const pollutants = {
                O3: this.o3,
                PM10: this.pm10,
                PM2_5: this.pm2_5,
                NO2: this.no2,
                CO: this.co,
                SO2: this.so2,
            };
    
            const pollutantThresholds = {
                O3: 60,
                PM10: 20,
                PM2_5: 10,
                NO2: 40,
                CO: 4400,
                SO2: 20,
            };
    
            let causeOfLowerAQI = [];
            for (const pollutant in pollutants) {
                if (pollutants[pollutant] > pollutantThresholds[pollutant]) {
                    causeOfLowerAQI.push(pollutant);
                }
            }
    
            if (causeOfLowerAQI.length > 0) {
                return `The pollutant(s) causing AQI to be worse: ${causeOfLowerAQI.join(', ')}`;
            } else {
                return "All pollutants are within good levels.";
            }
        },
        

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
            this.loading = true;

            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apiKey}&units=metric`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                this.weatherData = data;
                this.weatherData.main.temp = Math.round(this.weatherData.main.temp);
                this.weatherData.rain = data.rain;
                
                this.description = this.auxDisplay(data.main.temp);
                
                this.displayInput = `You entered: ${this.city}`;

                const d = new Date();
                const dayName = days[d.getDay()];
                const monthName = months[d.getMonth()];
                const day = d.getDate();
                const year = d.getFullYear();

                this.formattedDateToday = `${dayName}, ${day} ${monthName} ${year}`;
                
                
                let geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=${apiKey}`;
                try {
                    const response = await fetch(geoApiUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                let {name, lat, lon, country} = data[0];
                this.cityName = name;
                this.countryName = country;
                this.latitudeProperty = lat;
                this.longitudeProperty = lon;

                } catch (error) {
                this.errorMessage = `Error: ${error.message}`;  
                }
            } catch (error) {
                this.errorMessage = `Error: ${error.message}`;
            }
            finally {
                this.loading = false;
                if(this.activated3days){
                    this.handle3DaysButtonClick();
                }
                if(this.activatedAirQuality){
                    this.handleAirQualityButtonClick();
                }
            }
        },
        async handle3DaysButtonClick() {
            if (this.city.trim() === "") {
                this.errorMessage = "Input cannot be empty.";
                this.displayInput = "";
                return;
            }
            this.loading = true;
            this.errorMessage = "";
        
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${apiKey}&units=metric`;
        
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                this.activated3days = true;

                const groupedData = {};
                
                data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0];  
                    console.log(item.weather[0]);
                    if (!groupedData[date]) {
                        groupedData[date] = {
                            temps: [], 
                            weather: item.weather[0],  
                            rainChance: Math.round(item.pop * 100).toFixed(0),  
                            windSpeeds: [] 

                        };
                    }
                    
                    groupedData[date].temps.push(item.main.temp);  
                    groupedData[date].windSpeeds.push(item.wind.speed);

                });
        
               
                this.forecastData = Object.keys(groupedData).slice(0, 3).map(date => {
                    const d = new Date(date);
                    const dayName = days[d.getDay()];
                    const monthName = months[d.getMonth()];
                    const day = d.getDate();
                    const year = d.getFullYear();
                    this.formattedDate = `${dayName}, ${day},    ${monthName} ${year}`;
                    
                    const temps = groupedData[date].temps;
                    let maxTemp = Math.round(Math.max(...temps));
                    let minTemp = Math.round(Math.min(...temps));
                    let averageTemp = maxTemp + minTemp / 2;
                    return {
                        date: this.formattedDate,
                        maxTemp: maxTemp,
                        minTemp: minTemp,
                        weatherDescription: this.auxDisplay(averageTemp),  
                        rainChance: groupedData[date].rainChance,
                        avgWindSpeed: (groupedData[date].windSpeeds.reduce((a, b) => a + b, 0) / groupedData[date].windSpeeds.length).toFixed(2)  
                    };
                });
                this.forecastWeatherData = { temp: this.forecastData[0].maxTemp }; 
            } catch (error) {
                this.errorMessage = `Error: ${error.message}`;
            }
            finally {
                this.loading = false;
            }
        },
        handleTodayButtonClick() {
            this.handleFormSubmit();
        },
        async handleAirQualityButtonClick() {
            if (this.city.trim() === "") {
                this.errorMessage = "Input cannot be empty.";
                this.displayInput = "";
                return;
            }
            this.errorMessage = "";
            this.loading = true;
            const airApiCall = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${this.latitudeProperty}&lon=${this.longitudeProperty}&appid=${apiKey}`;
            
            try {
                const response = await fetch(airApiCall);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                this.activatedAirQuality = true;
                this.airData = data;
                let {co, no, no2, o3, so2, pm2_5, pm10, nh3} = data.list[0].components;
                this.co = co;
                this.no = no;
                this.no2 = no2;
                this.o3 = o3;
                this.pm2_5 = pm2_5;
                this.pm10 = pm10;
                this.so2 = so2;
                this.nh3 = nh3;
                this.airquality = data.list[0].main.aqi;
                
            } catch (error) {
                
                this.errorMessage = `Error: ${error.message}`;
            } finally {
                this.loading = false; 
            }
            
        },
        handleNewFeatButtonClick() {
            // Implement the logic for fetching and displaying landscape & tourism data
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
                
                let map = L.map('map').setView([this.userCoordinates.latitude, this.userCoordinates.longitude], 4); 
                
                
                L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=WA2dNh7InZuBzttxGdeH`, {
                    
                }).addTo(map);
                L.control.rainviewer({
                    position: 'bottomleft',
                    nextButtonText: '>',
                    playStopButtonText: 'Play/Stop',
                    prevButtonText: '<',
                    positionSliderLabelText: "Hour:",
                    opacitySliderLabelText: "Opacity:",
                    animationInterval: 2000,
                    opacity: 0.5
                }).addTo(map);
                    
                
                const marker = L.marker([this.userCoordinates.latitude, this.userCoordinates.longitude]).addTo(map);
                marker.bindPopup('You are here!').openPopup();
            }
        }
        
        
        
    },
    
    mounted() {
        this.getUserCoordinates();
    }
});