import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs/promises'

// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;

  constructor(name: string) {
    this.name = name;
    this.id = uuidv4();
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
  constructor() {}

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    const history = await fs.readFile(`db/searchHistory.json`, 'utf8');
    return history;
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    await fs.writeFile(`db/searchHistory.json`, JSON.stringify(cities));
    return;
  }

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    try {
      const history: City[] = JSON.parse(await this.read());
      return history;
    } catch (error) {
      console.error(`There was an error reading the JSON`);
      const history: City[] = [];
      return history;
    }
  }

  // TODO: Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const cities: City[] = await this.getCities();
    const index = cities.findIndex((c) => c.name.toLowerCase() === city.toLowerCase());
    if (index === -1) {
      const newCity = new City(city);
      cities.push(newCity);
      await this.write(cities);
    }
    return;
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const cities: City[] = await this.getCities();
    const index = cities.findIndex((city) => city.id === id);
    if (index !== -1) {
      cities.splice(index, 1);
      console.log(`City deleted`);
      await this.write(cities);
    }
    return;
  }
}

export default new HistoryService();