<template>
  <div>
    <h2>NBA Teams</h2>
    <div v-if="teamsData" class="teams-container">
      <div v-for="league in teamsData.sports[0].leagues" :key="league.id" class="league">
        <div class="teams">
          <div v-for="team in league.teams" :key="team.team.id" class="team-card">
            <img :src="team.team.logos[0].href" :alt="team.team.displayName" class="team-logo" />
            <h4>{{ team.team.displayName }}</h4>
          </div>
        </div>
      </div>
    </div>
    <p v-else>Loading team data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
// @ts-ignore
import { fetchTeamsData } from '../apiService';

// Define interfaces for type safety
interface Logo {
  href: string;
  alt: string;
  rel: string[];
  width: number;
  height: number;
}

interface Team {
  id: string;
  displayName: string;
  logos: Logo[];
}

interface League {
  id: string;
  name: string;
  teams: { team: Team }[];
}

interface Sport {
  id: string;
  leagues: League[];
}

interface TeamsData {
  sports: Sport[];
}

export default defineComponent({
  name: 'TeamsViewer',
  setup() {
    const teamsData = ref<TeamsData | null>(null);

    const loadTeamsData = async () => {
      try {
        const data = await fetchTeamsData();
        teamsData.value = data;
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    onMounted(() => {
      console.log('TeamViewer mounted');
      loadTeamsData();
    });

    return { teamsData };
  },
});
</script>

<style scoped>
.teams-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.league {
  padding: 10px;
}

.teams {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.team-card {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  width: 150px;
}

.team-logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}
</style>