<template>
  <div>
    <h2>Team Data</h2>
    <pre v-if="teamsData">{{ teamsData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
// @ts-ignore
import { fetchTeamsData } from '../apiService';

export default defineComponent({
  name: 'TeamsViewer',
  setup() {
    const teamsData = ref(null);

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