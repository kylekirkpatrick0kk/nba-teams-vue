const axios = require('axios');

const TEAM_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams';

exports.handler = async function (event, context) {
  const { team } = event.queryStringParameters;

  if (!team) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Team parameter is required' }),
    };
  }

  try {
    const response = await axios.get(`${TEAM_API_URL}/${team}`);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching team data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch team data' }),
    };
  }
};