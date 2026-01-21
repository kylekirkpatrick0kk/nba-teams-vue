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
            <button
              class="favorite-btn"
              :aria-pressed="isFav(team.team.abbreviation) ? 'true' : 'false'"
              :title="isFav(team.team.abbreviation) ? 'Unfavorite' : 'Favorite'"
              @click.stop="toggleFavorite(team.team.abbreviation)"
            >
              <span class="star" :class="{ active: isFav(team.team.abbreviation) }">★</span>
            </button>
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
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import TeamDetails from './TeamDetails.vue';
// @ts-ignore
import { fetchTeamsData } from '../apiService';
import { getFavoriteTeam, setFavoriteTeam, clearFavoriteTeam } from '../favorites';

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
    const favoriteAbbr = ref<string | null>(getFavoriteTeam());
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

    const toggleFavorite = (abbr: string) => {
      if (favoriteAbbr.value && favoriteAbbr.value.toUpperCase() === abbr.toUpperCase()) {
        clearFavoriteTeam();
        favoriteAbbr.value = null;
      } else {
        setFavoriteTeam(abbr);
        favoriteAbbr.value = abbr;
      }
    };

    const isFav = (abbr: string) => {
      return !!favoriteAbbr.value && favoriteAbbr.value.toUpperCase() === abbr.toUpperCase();
    };

    const handleFavEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      favoriteAbbr.value = detail || null;
    };

    onMounted(() => {
      console.log('TeamViewer mounted');
      loadTeamsData();
      if (typeof window !== 'undefined') {
        window.addEventListener('favorite-team-changed', handleFavEvent as EventListener);
      }
    });

    onBeforeUnmount(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('favorite-team-changed', handleFavEvent as EventListener);
      }
    });

    return { teamsData, selectedTeam, selectTeam, favoriteAbbr, toggleFavorite, isFav };
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
  position: relative;
}

.team-logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}

.favorite-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  line-height: 1;
}
.star {
  font-size: 18px;
  color: #bbb;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));
}
.star.active {
  color: #ffcc00;
}
</style>