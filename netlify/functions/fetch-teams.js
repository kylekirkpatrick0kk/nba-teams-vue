const axios = require('axios');

const TEAMS_API_URL = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams';

exports.handler = async function(event, context) {
  try {
    const response = await axios.get(TEAMS_API_URL);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch teams' }),
    };
  }
};