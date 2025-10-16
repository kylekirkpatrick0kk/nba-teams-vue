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
                  <img
                    :src="competitor.team.logo"
                    :alt="competitor.team.displayName + ' Logo'"
                    class="team-logo clickable"
                    :title="'View ' + competitor.team.displayName + ' details'"
                    @click="goToTeam(competitor.team)"
                  />
                  <span
                    class="team-name clickable"
                    :title="'View ' + competitor.team.displayName + ' details'"
                    @click="goToTeam(competitor.team)"
                  >{{ competitor.team.displayName }}</span>
                  <div class="team-record">
                    {{ competitor.records.find(record => record.type === 'total')?.summary || '' }}
                  </div>
                </template>
              </span>
              <span class="vs"> @ </span>
              <span v-for="competitor in competition.competitors" :key="competitor.id">
                <template v-if="competitor.homeAway === 'home'">
                  <span
                    class="team-name clickable"
                    :title="'View ' + competitor.team.displayName + ' details'"
                    @click="goToTeam(competitor.team)"
                  >{{ competitor.team.displayName }}</span>
                  <img
                    :src="competitor.team.logo"
                    :alt="competitor.team.displayName + ' Logo'"
                    class="team-logo clickable"
                    :title="'View ' + competitor.team.displayName + ' details'"
                    @click="goToTeam(competitor.team)"
                  />
                  <div class="team-record">
                    {{ competitor.records.find(record => record.type === 'total')?.summary || '' }}
                  </div>
                </template>
              </span>
            </div>
            <p class="game-time">
              <template v-if="hasGameStarted(competition.date)">
                {{ getScore(competition.competitors) }}
                <span class="game-status">{{ getGameStatus(competition.status) }}</span>
              </template>
              <template v-else>
                {{ formatLocalTime(competition.date) }}
              </template>
            </p>
            <!-- Odds / Betting Info -->
            <div v-if="getPrimaryOdds(competition)" class="odds-card">
              <div class="odds-header">
                <div class="provider">
                  <img
                    v-if="getPrimaryOdds(competition).header?.logo?.light"
                    :src="getPrimaryOdds(competition).header.logo.light"
                    :alt="getPrimaryOdds(competition).provider?.name || 'Odds Provider'"
                    class="provider-logo"
                  />
                  <span class="provider-name">{{ getPrimaryOdds(competition).provider?.name || getPrimaryOdds(competition).header?.text || 'Odds' }}</span>
                </div>
                <a
                  v-if="buildOddsMoreUrl(competition)"
                  class="more-odds-link"
                  :href="buildOddsMoreUrl(competition)"
                  target="_blank"
                  rel="noopener noreferrer"
                >More</a>
              </div>
              <div class="odds-grid">
                <div class="odds-block" v-if="getPrimaryOdds(competition).pointSpread">
                  <span class="odds-label">Spread</span>
                  <span class="odds-value">
                    <template v-if="getPrimaryOdds(competition).pointSpread.away?.close">
                      {{ formatSpread(getPrimaryOdds(competition).pointSpread.away.close.line) }} ({{ addPlus(getPrimaryOdds(competition).pointSpread.away.close.odds) }})
                    </template>
                    <span class="divider"> / </span>
                    <template v-if="getPrimaryOdds(competition).pointSpread.home?.close">
                      {{ formatSpread(getPrimaryOdds(competition).pointSpread.home.close.line) }} ({{ addPlus(getPrimaryOdds(competition).pointSpread.home.close.odds) }})
                    </template>
                  </span>
                </div>
                <div class="odds-block" v-if="getPrimaryOdds(competition).moneyline">
                  <span class="odds-label">Moneyline</span>
                  <span class="odds-value">
                    <template v-if="getPrimaryOdds(competition).moneyline.away?.close">
                      {{ addPlus(getPrimaryOdds(competition).moneyline.away.close.odds) }}
                    </template>
                    <span class="divider"> / </span>
                    <template v-if="getPrimaryOdds(competition).moneyline.home?.close">
                      {{ addPlus(getPrimaryOdds(competition).moneyline.home.close.odds) }}
                    </template>
                  </span>
                </div>
                <div class="odds-block" v-if="getPrimaryOdds(competition).total">
                  <span class="odds-label">Total</span>
                  <span class="odds-value">
                    <template v-if="getPrimaryOdds(competition).total.over?.close">
                      O {{ stripPrefix(getPrimaryOdds(competition).total.over.close.line) }} ({{ addPlus(getPrimaryOdds(competition).total.over.close.odds) }})
                    </template>
                    <span class="divider"> / </span>
                    <template v-if="getPrimaryOdds(competition).total.under?.close">
                      U {{ stripPrefix(getPrimaryOdds(competition).total.under.close.line) }} ({{ addPlus(getPrimaryOdds(competition).total.under.close.odds) }})
                    </template>
                  </span>
                </div>
              </div>
            </div>
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
      },
      getGameStatus(status) {
        return status.type.shortDetail;
      },
      goToTeam(team) {
        // Prefer abbreviation; fallback to slug or displayName processed similarly to TeamDetails expectations
        const city = (team.abbreviation || team.slug || team.displayName || '').toString();
        if (!city) return;
        this.$router.push({ name: 'TeamDetails', params: { city } });
      },
      getPrimaryOdds(competition) {
        return competition && competition.odds && competition.odds.length ? competition.odds[0] : null;
      },
      addPlus(value) {
        if (value === undefined || value === null) return '';
        const s = value.toString();
        if (s.startsWith('+') || s.startsWith('-')) return s; // already signed
        // Moneyline odds like 225 should display +225
        if (!isNaN(Number(s)) && Number(s) > 0) return '+' + s;
        return s;
      },
      formatSpread(line) {
        if (!line) return '';
        // Ensure numeric spreads like -7.5 or +7.5. ESPN sometimes sends "+7.5" already or "-7.5".
        let s = line.toString();
        if (!s.startsWith('+') && !s.startsWith('-')) {
          // Add plus if positive numeric
            if (!isNaN(Number(s)) && Number(s) > 0) s = '+' + s;
        }
        return s;
      },
      stripPrefix(line) {
        if (!line) return '';
        // total lines have o230.5 / u230.5; return 230.5
        return line.replace(/^[ou]/i, '');
      },
      extractEventIdFromOdds(competition) {
        const odds = this.getPrimaryOdds(competition);
        const href = odds?.link?.href || odds?.moneyline?.home?.close?.link?.href || odds?.moneyline?.away?.close?.link?.href;
        if (!href) return null;
        const match = href.match(/\/event\/([a-f0-9\-]+)/i); // capture UUID after /event/
        if (!match) return null;
        return match[1];
      },
      buildOddsMoreUrl(competition) {
        const eventId = this.extractEventIdFromOdds(competition);
        if (!eventId) return null;
        return `https://espnbet.com/sport/basketball/organization/united-states/competition/nba/event/${eventId}`;
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

.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}
.clickable:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 4px rgba(255,255,255,0.4));
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

.game-status {
  display: block;
  margin-top: 5px;
  font-size: 1em;
  color: #b0b0b0;
}

/* Odds Styling */
.odds-card {
  margin-top: 4px;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  padding: 8px 10px 10px;
  width: 100%;
  font-family: system-ui, Arial, sans-serif;
}
.odds-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.provider {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #e0e0e0;
}
.provider-logo {
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.1));
}
.more-odds-link {
  margin-left: auto;
  font-size: 0.65rem;
  text-decoration: none;
  color: #3fa9ff;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.more-odds-link:hover { text-decoration: underline; }
.odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 6px;
}
.odds-block {
  background: #1d1d1d;
  padding: 6px 8px 8px;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #272727;
  min-width: 0; /* allow grid item to shrink for long content */
}
.odds-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 600;
  color: #9e9e9e;
  letter-spacing: 0.7px;
  margin-bottom: 2px;
  text-transform: uppercase;
}
.odds-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f0f0f0;
  white-space: normal; /* allow wrapping */
  word-break: break-word;
  line-height: 1.05;
}
.divider { color: #555; margin: 0 2px; }
</style>