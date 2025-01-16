class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const HISTORY_FILE = 'db/searchHistory.json';

class HistoryService {
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8');
      return JSON.parse(data) || [];
    } catch (err) {
      console.error("Error reading history file:", (err as Error).message);
      return [];
    }
  }

  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(HISTORY_FILE, JSON.stringify(cities, null, 2));
    } catch (err) {
      console.error("Error writing to history file:", (err as Error).message);
    }
  }

  async getCities(): Promise<City[]> {
    try {
      const cities = await this.read();
      return cities;
    } catch (err) {
      console.error("Error fetching cities:", (err as Error).message);
      throw new Error("Failed to fetch cities.");
    }
  }

  async addCity(cityName: string): Promise<void> {
    try {
      if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
        throw new Error("Invalid city name.");
      }

      const cities = await this.read();
      if (!cities.some((city) => city.name.toLowerCase() === cityName.toLowerCase())) {
        cities.push(new City(uuidv4(), cityName));
        await this.write(cities);
      }
    } catch (err) {
      console.error("Error adding city:", (err as Error).message);
      throw new Error("Failed to add city.");
    }
  }

  async removeCity(id: string): Promise<void> {
    try {
      const cities = await this.read();
      const updatedCities = cities.filter((city) => city.id !== id);

      if (cities.length === updatedCities.length) {
        throw new Error("City not found.");
      }

      await this.write(updatedCities);
    } catch (err) {
      console.error("Error removing city:", (err as Error).message);
      throw new Error("Failed to remove city.");
    }
  }
}

export default new HistoryService();
