// src/apiService.js
import axios from 'axios';

const NETLIFY_FUNCTIONS_URL = '/.netlify/functions';

export const fetchData = async () => {
  try {
    const response = await axios.get(`${NETLIFY_FUNCTIONS_URL}/fetch-games`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchNewsData = async () => {
  try {
    const response = await axios.get(`${NETLIFY_FUNCTIONS_URL}/fetch-news`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchTeamsData = async () => {
  try {
    const response = await axios.get(`${NETLIFY_FUNCTIONS_URL}/fetch-teams`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}