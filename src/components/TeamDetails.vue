<template>
  <div v-if="teamData" class="team-details">
    <h2>{{ teamData.displayName }}</h2>
    <img :src="teamData.logos[0].href" :alt="teamData.displayName" class="team-logo" />

    <h3>Records</h3>
    <div v-for="recordItem in teamData.record.items" :key="recordItem.type" class="record-item">
      <h4>{{ recordItem.description }} ({{ recordItem.summary }})</h4>
      <ul>
        <li v-for="stat in recordItem.stats" :key="stat.name">
          <strong>{{ stat.name }}:</strong> {{ stat.value }}
        </li>
      </ul>
    </div>
  </div>
  <p v-else>Loading team data...</p>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
// @ts-ignore
import { fetchTeamData } from '../apiService';

// Define interfaces for type safety
interface Logo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
  lastUpdated: string;
}

interface Stat {
  name: string;
  value: number;
}

interface RecordItem {
  description: string;
  type: string;
  summary: string;
  stats: Stat[];
}

interface Link {
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface TeamData {
  id: string;
  uid: string;
  slug: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logos: Logo[];
  record: { items: RecordItem[] };
  links: Link[];
}

export default defineComponent({
  name: 'TeamDetails',
  props: {
    city: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const teamData = ref<TeamData | null>(null);

    const loadTeamData = async (city: string) => {
      try {
        const formattedCity = city.toLowerCase().trim().replace(' ', '');
        const data = await fetchTeamData(formattedCity);
        teamData.value = data.team; // Bind the `team` object from the response
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    // Watch for changes in the `city` prop and reload data
    watch(() => props.city, (newCity) => {
      loadTeamData(newCity);
    });

    onMounted(() => {
      loadTeamData(props.city);
    });

    return { teamData };
  },
});
</script>

<style scoped>
.team-details {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.team-logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 20px;
}

.record-item {
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 5px 0;
}
</style>