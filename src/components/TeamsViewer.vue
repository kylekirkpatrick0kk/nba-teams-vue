<template>
  <div>
    <h2>NBA Teams</h2>
    <div v-if="teamsData" class="teams-container">
      <div v-for="league in teamsData.sports[0].leagues" :key="league.id" class="league">
        <div class="teams">
          <div
            v-for="team in league.teams"
            :key="team.team.id"
            class="team-card"
            @click="selectTeam(team.team.abbreviation)"
          >
            <img :src="team.team.logos[0].href" :alt="team.team.displayName" class="team-logo" />
            <h4>{{ team.team.displayName }}</h4>
          </div>
        </div>
      </div>
    </div>
    <p v-else>Loading team data...</p>
    <TeamDetails v-if="selectedTeam" :city="selectedTeam" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TeamDetails from './TeamDetails.vue';
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
  slug: string;
  abbreviation: string;
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
  components: { TeamDetails },
  setup() {
    const teamsData = ref<TeamsData | null>(null);
    const selectedTeam = ref<string | null>(null);
    const router = useRouter();

    const loadTeamsData = async () => {
      try {
        const data = await fetchTeamsData();
        teamsData.value = data;
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    const selectTeam = (city: string) => {
      selectedTeam.value = city;
      router.push({ name: 'TeamDetails', params: { city } });
    };

    onMounted(() => {
      console.log('TeamViewer mounted');
      loadTeamsData();
    });

    return { teamsData, selectedTeam, selectTeam };
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
  cursor: pointer;
}

.team-logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}
</style>