// historyService.ts
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs/promises';

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
    // TODO: Define a read method that reads from the searchHistory.json file
    async read(): Promise<string> {
        try {
            const history = await fs.readFile('db/searchHistory.json', 'utf8');
            return history;
        } catch (error: unknown) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                console.warn('searchHistory.json not found, returning empty history.');
                return '[]';
            }
            throw error;
        }
    }

    // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
    async write(cities: City[]): Promise<void> {
        try {
            await fs.writeFile('db/searchHistory.json', JSON.stringify(cities, null, 2));
        } catch (error: unknown) {
            console.error('Error writing to searchHistory.json:', (error as Error).message);
        }
    }

    // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities(): Promise<City[]> {
        try {
            const history = JSON.parse(await this.read());
            return Array.isArray(history) ? history.map((city: City) => new City(city.name)) : [];
        } catch (error: unknown) {
            console.error('Error reading cities from history:', (error as Error).message);
            return [];
        }
    }

    // TODO: Define an addCity method that adds a city to the searchHistory.json file
    async addCity(cityName: string): Promise<void> {
        try {
            const cities = await this.getCities();
            const cityExists = cities.some((city) => city.name.toLowerCase() === cityName.toLowerCase());
            if (!cityExists) {
                const newCity = new City(cityName);
                cities.push(newCity);
                await this.write(cities);
            }
        } catch (error: unknown) {
            console.error('Error adding city to history:', (error as Error).message);
        }
    }

    // TODO: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id: string): Promise<void> {
        try {
            const cities = await this.getCities();
            const updatedCities = cities.filter((city) => city.id !== id);
            await this.write(updatedCities);
        } catch (error: unknown) {
            console.error('Error removing city from history:', (error as Error).message);
        }
    }
}

export default new HistoryService();