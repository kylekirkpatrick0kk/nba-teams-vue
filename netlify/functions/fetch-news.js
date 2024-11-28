// netlify/functions/fetch-news.js
const axios = require('axios');

const NEWS_API_URL = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';

exports.handler = async function(event, context) {
  try {
    const response = await axios.get(NEWS_API_URL);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch news' }),
    };
  }
};