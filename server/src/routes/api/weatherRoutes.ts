import { Router, type Request, type Response } from "express";
const router = Router();

import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// POST Request with city name to retrieve weather data
router.post("/", async (req: Request, res: Response) => {
  try {
    const cityName = req.body.cityName;

    // Validate city name
    if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
      return res.status(400).json({ error: "Valid city name is required." });
    }

    // GET weather data from city name
    const forecast = await new WeatherService(cityName).getWeatherForCity();

    // Save city to search history
    try {
      await HistoryService.addCity(cityName);
    } catch (error) {
      console.error("Error saving city to history:", (error as Error).message);
      return res.status(500).json({ error: "Failed to save city to history." });
    }

    // Return the forecast data
    return res.status(200).json({
      message: `Weather forecast for ${cityName} retrieved successfully.`,
      cityName,
      forecast,
    });
  } catch (err) {
    console.error("Error fetching weather data:", (err as Error).message);
    return res.status(500).json({ error: "Failed to retrieve weather data." });
  }
});

// GET search history
router.get("/history", async (_req: Request, res: Response) => {
  try {
    const savedCities = await HistoryService.getCities();
    return res.status(200).json(savedCities);
  } catch (err) {
    console.error("Error fetching search history:", (err as Error).message);
    return res.status(500).json({ error: "Failed to retrieve search history." });
  }
});

// DELETE city from search history
router.delete("/history/:id", async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "City ID is required for deletion." });
    }
    await HistoryService.removeCity(req.params.id);
    return res.json({ success: "City successfully removed from search history" });
  } catch (err) {
    console.error("Error deleting city from history:", (err as Error).message);
    return res.status(500).json({ error: "Failed to delete city from search history." });
  }
});

export default router;