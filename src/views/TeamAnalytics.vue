<template>
  <div>
    <h1>Team Analytics</h1>
    <TeamsViewer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeamsViewer from '../components/TeamsViewer.vue';

export default defineComponent({
  name: 'TeamAnalytics',
  components: {
    TeamsViewer,
  },
});
</script>