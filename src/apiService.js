// src/apiService.js
import axios from 'axios';

const API_URL = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export const fetchData = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};