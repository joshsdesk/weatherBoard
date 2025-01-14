import dotenv from 'dotenv';
dotenv.config();

// TODO: Define a Weather class with appropriate properties
class Weather {
    city: string;
    date: string;
    icon: string;
    iconDescription: string;
    tempF: number;
    windSpeed: number;
    humidity: number;

    constructor(
        city: string,
        date: string,
        icon: string,
        iconDescription: string,
        tempF: number,
        windSpeed: number,
        humidity: number
    ) {
        this.city = city;
        this.date = date;
        this.icon = icon;
        this.iconDescription = iconDescription;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
    }
}

// Define the return type for the getWeatherForCity method
interface WeatherData {
    current: Weather | null;
    forecast: Weather[];
}

// TODO: Complete the WeatherService class
class WeatherService {
    baseURL: string;
    apiKey: string;
    cityName: string;

    constructor(cityName: string) {
        this.baseURL = process.env.API_BASE_URL || '';
        this.apiKey = process.env.API_KEY || '';
        this.cityName = cityName;
    }

    // TODO: Create fetchLocationData method
    async fetchLocationData(): Promise<any> {
        try {
            const query = `q=${this.cityName}&limit=1&appid=${this.apiKey}`;
            const response = await fetch(`${this.baseURL}/geo/1.0/direct?${query}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch location data. Status: ${response.status}`);
            }
            return await response.json();
        } catch (error: unknown) {
            console.error('Error fetching location data:', (error as Error).message);
            return [];
        }
    }

    // TODO: Create destructureLocationData method
    destructureLocationData(locationData: any): { lat: number; lon: number } {
        try {
            const lat = locationData[0]?.lat || 0;
            const lon = locationData[0]?.lon || 0;
            return { lat, lon };
        } catch (error: unknown) {
            console.error('Error destructuring location data:', (error as Error).message);
            this.cityName = 'Unknown Location';
            return { lat: 0, lon: 0 };
        }
    }

    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates: { lat: number; lon: number }): Promise<any> {
        try {
            const weatherURL = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
            const response = await fetch(weatherURL);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            return await response.json();
        } catch (error: unknown) {
            console.error('Error fetching weather data:', (error as Error).message);
            throw error;
        }
    }

    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(): Promise<WeatherData> {
        try {
            const locationData = await this.fetchLocationData();
            const coordinates = this.destructureLocationData(locationData);
            const weatherData = await this.fetchWeatherData(coordinates);

            // Extract current weather
            const currentWeatherData = weatherData.list[0];
            const current = new Weather(
                this.cityName,
                new Date(currentWeatherData.dt_txt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                currentWeatherData.weather[0].icon,
                currentWeatherData.weather[0].description,
                currentWeatherData.main.temp,
                currentWeatherData.wind.speed,
                currentWeatherData.main.humidity
            );

            // Extract forecast for the next 5 days (excluding today)
            const forecastData: { [key: string]: any } = {};
            weatherData.list.forEach((item: any) => {
                const date = new Date(item.dt_txt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
                if (!forecastData[date] && new Date(item.dt_txt).getDate() !== new Date().getDate()) {
                    forecastData[date] = item;
                }
            });

            const forecast = Object.values(forecastData)
                .slice(0, 5)
                .map((item: any) => {
                    const formattedDate = new Date(item.dt_txt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                    return new Weather(
                        this.cityName,
                        formattedDate,
                        item.weather[0].icon,
                        item.weather[0].description,
                        item.main.temp,
                        item.wind.speed,
                        item.main.humidity
                    );
                });

            return { current, forecast };
        } catch (error: unknown) {
            console.error('Error getting weather for city:', (error as Error).message);
            return { current: null, forecast: [] };
        }
    }
}

export default WeatherService;