// import { Router, type Request, type Response } from 'express';
// import { Router, Request, Response } from 'express';
import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const city = req.body.cityName
  // TODO: GET weather data from city name
  const weather = new WeatherService(city)
  res.send(await weather.getWeatherForCity())
  // TODO: save city to search history
  HistoryService.addCity(city)
  res.json({ message: "City added to history" });
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  const cities = await HistoryService.getCities()
  res.send(cities)
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  HistoryService.removeCity(req.params.id)
  res.send(`search deleted`)
});

export default router;
