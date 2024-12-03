<template>
    <div class="news-container">
      <ul class="news-list">
        <li v-for="article in articles" :key="article.dataSourceIdentifier" class="news-item">
          <h3 class="headline">
            <a :href="article.links.web.href" target="_blank" rel="noopener noreferrer">{{ article.headline }}</a>
          </h3>
          <p class="description">{{ article.description }}</p>
        </li>
      </ul>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  // @ts-ignore
  import { fetchNewsData } from '../apiService';
  
  interface Article {
    dataSourceIdentifier: string;
    type: string;
    headline: string;
    description: string;
    lastModified: string;
    published: string;
    links: {
      web: {
        href: string;
      };
    };
  }
  
  export default defineComponent({
    name: 'NewsViewer',
    setup() {
      const articles = ref<Article[]>([]);
  
      const loadNews = async () => {
        try {
          const data = await fetchNewsData();
          articles.value = data.articles;
        } catch (error) {
          console.error('Error fetching news:', error);
        }
      };
  
      onMounted(() => {
        loadNews();
      });
  
      return {
        articles,
      };
    },
  });
  </script>
  
  <style scoped>
  .news-container {
    padding: 20px;
    background-color: #2e2e2e;
    color: #e0e0e0;
    border-radius: 8px;
  }
  
  .news-list {
    list-style-type: none;
    padding: 0;
  }
  
  .news-item {
    margin-bottom: 20px;
  }
  
  .headline {
    font-size: 1.5em;
    font-weight: bold;
  }

  .headline a {
    color: inherit;
    text-decoration: none;
  }

  .headline a:hover {
    text-decoration: underline;
  }
  
  .description {
    font-size: 1.2em;
    color: #b0b0b0;
  }
  </style>