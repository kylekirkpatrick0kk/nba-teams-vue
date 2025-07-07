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

<style scoped>
h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e0e0e0; /* Dark text for the heading */
}

.toggle-news-button {
  background-color: #007bff; /* Blue button */
  color: #ffffff; /* White text */
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-news-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

.toggle-news-button:focus {
  outline: none;
  box-shadow: 0 0 5px #0056b3; /* Focus effect */
}

.NewsViewer,
.DataViewer {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #dee2e6; /* Light border for separation */
  border-radius: 8px;
  background-color: #ffffff; /* White background for content */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}
</style>