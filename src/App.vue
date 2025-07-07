<template>
  <div id="app">
    <nav class="navigation">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/team-analytics" class="nav-link">Team Analytics</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
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

.navigation {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.nav-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
}

.nav-link:hover {
  color: #0056b3;
}
</style>