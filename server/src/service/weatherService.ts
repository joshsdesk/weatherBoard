import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: string, icon: string, iconDescription: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city,
    this.date = date,
    this.icon = icon,
    this.iconDescription = iconDescription,
    this.tempF = tempF,
    this.windSpeed = windSpeed,
    this.humidity = humidity
  }

}

// TODO: Complete the WeatherService class
class WeatherService {
  
  // TODO: Define the baseURL, API key, and city name properties
  baseURL: string;
  apiKey: string;
  cityName: string;

  constructor(cityName: string) {
    this.baseURL = `${process.env.API_BASE_URL}`
    this.apiKey = `${process.env.API_KEY}`
    this.cityName = cityName
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    const response = await fetch(`${this.baseURL}/geo/1.0/direct?${query}`)

    if (!response.ok) {
      console.log('could not fetch location data')
    return []
    }
    else {
    const coordinates:Coordinates[] = await response.json()
    return coordinates
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates[]): Coordinates {
    try {
      const lat = locationData[0].lat
      const lon = locationData[0].lon
      return {lat: lat, lon: lon}
      
    } catch (error) {
      console.error(`location not found`)
      this.cityName = `location not found`
      return {lat: 90, lon: 0}
    }
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `q=${this.cityName}&limit=1&appid=${this.apiKey}`
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return  this.destructureLocationData(await this.fetchLocationData(this.buildGeocodeQuery()))
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const currentWeather = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?${this.buildWeatherQuery(coordinates)}`)).json()
    const forecast = await (await fetch(`https://api.openweathermap.org/data/2.5/forecast?${this.buildWeatherQuery(coordinates)}`)).json()
    return {currentWeather: currentWeather, forecast: forecast}
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const current = response
    let name
    if (this.cityName === `location not found`) {name = `Location not found, here's the north pole instead!`}
    else {name = response.name}
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = (new Date()).toLocaleDateString('en-US', dateOptions);
    return new Weather(name, formattedDate, current.weather[0].icon, current.weather[0].description, current.main.temp, current.wind.speed, current.main.humidity)
  }
  
  private parseForecast(response: any) {
    const daysUnfiltered: any[] = response.list
    const days: any[] = daysUnfiltered.filter((entry: any) => entry.dt_txt.includes(`12:00:00`))
    const forecast: Weather[] = []
    let name
    if (this.cityName === `location not found`) {name = `Location not found`}
    else {name = response.name}
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    for (const day of days) {
      const formattedDate = (new Date(day.dt_txt)).toLocaleDateString('en-US', dateOptions);
      const weather = new Weather(name, formattedDate, day.weather[0].icon, day.weather[0].description, day.main.temp, day.wind.speed, day.main.humidity)
      forecast.push(weather)
    }
    return forecast
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherArray: Weather[] = [currentWeather]
    weatherArray.push(...weatherData)
    return weatherArray
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity() {
    try {const locationData = await this.fetchAndDestructureLocationData()
      const combinedWeatherData = await this.fetchWeatherData(locationData)
      
      const current = this.parseCurrentWeather(combinedWeatherData.currentWeather)
      const forecast = this.parseForecast(combinedWeatherData.forecast)
  
      const weather = this.buildForecastArray(current, forecast)
      return weather;
   
      
    } catch (error) {
      console.error(`there was an error getting weather data`)
      return
    }
  }
}

export default WeatherService;