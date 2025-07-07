<template>
  <div>
    <h1>NBA GAMEDAY</h1>
    <button @click="toggleNews" class="toggle-news-button">
      {{ showNews ? 'Hide News' : 'Show News' }}
    </button>
    <NewsViewer v-if="showNews" />
    <DataViewer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DataViewer from '../components/DataViewer.vue';
import NewsViewer from '../components/NewsViewer.vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    DataViewer,
    NewsViewer,
  },
  setup() {
    const showNews = ref(false);

    const toggleNews = () => {
      showNews.value = !showNews.value;
    };

    return {
      showNews,
      toggleNews,
    };
  },
});
</script>