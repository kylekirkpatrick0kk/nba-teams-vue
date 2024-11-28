<template>
    <div>
      <div class="meta-info">
        <!-- date in top left -->
        <p class="date">{{ new Date().toDateString() }}</p>
        <!-- number of nba games (len of data.events) in top right -->
        <p v-if="data && data.events" class="game-count">Number of NBA games today: {{ data.events.length }}</p>
      </div>
      <ul v-if="data && data.events" class="game-list">
        <li v-for="event in data.events" :key="event.id" class="game-item">
          <div v-for="competition in event.competitions" :key="competition.id">
            <div class="competition">
              <span v-for="competitor in competition.competitors" :key="competitor.id">
                <template v-if="competitor.homeAway === 'away'">
                  <img :src="competitor.team.logo" alt="Away Team Logo" class="team-logo" />
                  <span class="team-name">{{ competitor.team.displayName }}</span>
                  <div class="team-record">
                    {{ competitor.records.find(record => record.type === 'total')?.summary || '' }}
                  </div>
                </template>
              </span>
              <span class="vs"> @ </span>
              <span v-for="competitor in competition.competitors" :key="competitor.id">
                <template v-if="competitor.homeAway === 'home'">
                  <span class="team-name">{{ competitor.team.displayName }}</span>
                  <img :src="competitor.team.logo" alt="Home Team Logo" class="team-logo" />
                  <div class="team-record">
                    {{ competitor.records.find(record => record.type === 'total')?.summary || '' }}
                  </div>
                </template>
              </span>
            </div>
            <p class="game-time">
              <template v-if="hasGameStarted(competition.date)">
                {{ getScore(competition.competitors) }}
              </template>
              <template v-else>
                {{ formatLocalTime(competition.date) }}
              </template>
            </p>
          </div>
        </li>
      </ul>
      <p v-else>Loading...</p>
    </div>
  </template>
  
  <script>
  import { fetchData } from '../apiService';
  
  export default {
    name: 'DataViewer',
    data() {
      return {
        data: null,
      };
    },
    async created() {
      try {
        this.data = await fetchData();
      } catch (error) {
        console.error('Error fetching data in component:', error);
      }
    },
    methods: {
      formatLocalTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      },
      hasGameStarted(gameDate) {
        return new Date() > new Date(gameDate);
      },
      getScore(competitors) {
        const away = competitors.find(c => c.homeAway === 'away');
        const home = competitors.find(c => c.homeAway === 'home');
        return `${away.score} - ${home.score}`;
      }
    }
  };
  </script>
  
  <style scoped>
.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ccc;
  padding: 10px 0;
}

.date {
  font-size: 1.2em;
  font-weight: bold;
}

.game-count {
  font-size: 1.2em;
  font-weight: bold;
}

.game-list {
  list-style-type: none; /* Remove bullet points */
  padding: 0;
}

.game-item {
  margin-bottom: 1em;
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
  display: flex;
  justify-content: center;
}

.competition {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
  justify-content: space-between;
}

.team-info {
  display: flex;
  align-items: center;
}

.team-logo {
  width: 50px;
  height: 50px;
  margin: 0 10px;
}

.team-name {
  font-size: 1.1em;
  font-weight: bold;
}

.vs {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0 10px;
}

.game-time {
  font-size: 1em;
  font-weight: normal;
  margin-left: 10px;
  align-self: center;
}

.team-record {
  font-size: 0.9em;
  font-weight: normal;
}

h1 {
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
  text-align: center;
}
</style>