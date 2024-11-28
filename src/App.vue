<template>
  <div id="app">
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
import DataViewer from './components/DataViewer.vue';
import NewsViewer from './components/NewsViewer.vue';

export default defineComponent({
  name: 'App',
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

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background-color: #2e2e2e;
  color: #e0e0e0;
}

.toggle-news-button {
  padding: 10px 20px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 20px;
}

.toggle-news-button:hover {
  background-color: #0056b3;
}
</style>