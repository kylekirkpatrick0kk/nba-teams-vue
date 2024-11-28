// netlify/functions/fetch-games.js
const axios = require('axios');

const API_URL = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

exports.handler = async function(event, context) {
  try {
    const response = await axios.get(API_URL);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching games:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch games' }),
    };
  }
};