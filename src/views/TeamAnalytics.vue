<template>
  <div>
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