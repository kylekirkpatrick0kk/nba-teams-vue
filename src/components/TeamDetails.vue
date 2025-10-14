<template>
  <div v-if="teamData" class="team-details">
    <!-- Hero Section -->
    <div class="team-hero" :style="heroStyle">
      <div class="logo-wrap">
        <img :src="teamData.logos[0].href" :alt="teamData.displayName" class="team-logo" />
      </div>
      <div class="team-heading">
        <h2>{{ teamData.displayName }}</h2>
        <div class="sub-heading">{{ teamData.location }} • {{ teamData.abbreviation }}</div>
        <div class="overall-record-badge" :class="differentialClass">
          {{ overallRecord?.summary || '—' }}
          <span class="diff" :class="differentialClass">
            {{ signedDifferential }}
          </span>
        </div>
      </div>
    </div>

    <!-- Key Stats Grid -->
    <div class="stats-grid" v-if="keyStats.length">
      <div class="stat-card" v-for="s in keyStats" :key="s.key" :class="valueClass(s.key, s.value)">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value" :title="s.rawValue">{{ s.display }}</div>
        <div v-if="s.key === 'winPercent'" class="progress" aria-label="Win Percent">
          <div class="progress-bar" :style="{ width: (Number(s.rawValue) * 100).toFixed(1) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Record Cards -->
    <h3 class="section-title">Records Breakdown</h3>
    <div class="record-cards">
      <div
        v-for="r in filteredRecords"
        :key="r.type"
        class="record-card"
      >
        <h4 class="record-title">
          {{ r.description }}
          <span class="record-summary">{{ r.summary }}</span>
        </h4>
        <ul class="record-stats">
          <li v-for="stat in r.stats.filter(s => !props.excludeRecordStats.includes(s.name))" :key="stat.name">
            <span class="stat-name">{{ prettify(stat.name) }}:</span>
            <span class="stat-num">{{ formatStat(stat) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <p v-else class="loading">Loading team data...</p>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
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
    // Route may optionally pass this; we still read from useRoute for robustness
    city: { type: String, required: false },
    // Keys used in keyStats computed (record, winPercent, avgPointsFor, etc.)
    excludeKeyStats: { type: Array as () => string[], default: () => [] },
    // Raw stat.name values inside each record item (wins, losses, winPercent, etc.)
    excludeRecordStats: { 
      type: Array as () => string[], 
      // Hide division win %, league win %, point differential variants, points for/against, and ties by default
      default: () => [
        'divisionWinPercent',
        'leagueWinPercent',
        'pointDifferential', // some feeds
        'differential',      // alternate name
        'pointsFor',
        'pointsAgainst',
        'ties',
        'points'
      ] 
    },
    // Optional mapping to rename stat labels (e.g., { avgPointsFor: 'Avg Pts +' })
    statLabelMap: { type: Object as () => Record<string,string>, default: () => ({}) }
  },
  setup(props) {
    const route = useRoute();
    const teamData = ref<TeamData | null>(null);

    const loadTeamData = async (city: string) => {
      try {
        const formattedCity = city.toLowerCase().trim().replace(' ', '');
        const data = await fetchTeamData(formattedCity);
        teamData.value = data.team;
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    watch(
      () => route.params.city,
      (newCity) => {
        if (typeof newCity === 'string') loadTeamData(newCity);
      },
      { immediate: true }
    );

    // Derived / helper computed
    const overallRecord = computed(() => teamData.value?.record.items.find(i => /overall/i.test(i.description) || i.type === 'total') || null);
    const homeRecord = computed(() => teamData.value?.record.items.find(i => /home/i.test(i.description) || i.type === 'home') || null);
    const awayRecord = computed(() => teamData.value?.record.items.find(i => /away|road/i.test(i.description) || i.type === 'road') || null);

    const pointDifferential = computed(() => {
      const stat = overallRecord.value?.stats.find(s => s.name === 'pointDifferential' || s.name === 'differential');
      return stat ? Number(stat.value) : 0;
    });
    const signedDifferential = computed(() => {
      const diff = pointDifferential.value;
      if (!diff) return '±0';
      return (diff > 0 ? '+' : '') + diff.toString();
    });
    const differentialClass = computed(() => pointDifferential.value > 0 ? 'pos' : (pointDifferential.value < 0 ? 'neg' : 'neu'));

    const heroStyle = computed(() => {
      const c = teamData.value?.color || '#222';
      const alt = teamData.value?.alternateColor || '#444';
      return {
        '--team-color': '#' + c.replace('#',''),
        '--team-alt-color': '#' + alt.replace('#',''),
        background: `linear-gradient(135deg, #${c.replace('#','')}dd, #${alt.replace('#','')}dd)`
      } as Record<string,string>;
    });

    const formatPercent = (v: number) => (v * 100).toFixed(1) + '%';

    const keyStats = computed(() => {
      if (!overallRecord.value) return [] as any[];
      const lookup = (names: string[]) => overallRecord.value!.stats.find(s => names.includes(s.name));
      const rawWinPct = lookup(['winPercent'])?.value;
      const wins = lookup(['wins'])?.value;
      const losses = lookup(['losses'])?.value;
      const avgFor = lookup(['avgPointsFor'])?.value;
      const avgAgainst = lookup(['avgPointsAgainst'])?.value;
      const streak = lookup(['streak'])?.value;
      const playoffSeed = lookup(['playoffSeed'])?.value;
      const diff = lookup(['pointDifferential','differential'])?.value;
      const gamesPlayed = lookup(['gamesPlayed'])?.value;

      const items: { key: string; label: string; value: any; rawValue: any; display: string }[] = [];
      if (wins !== undefined && losses !== undefined) items.push({ key: 'record', label: 'Record', value: `${wins}-${losses}`, rawValue: `${wins}-${losses}`, display: `${wins}-${losses}` });
      if (rawWinPct !== undefined) items.push({ key: 'winPercent', label: 'Win %', value: Number(rawWinPct), rawValue: rawWinPct, display: formatPercent(Number(rawWinPct)) });
      if (avgFor !== undefined) items.push({ key: 'avgPointsFor', label: 'Avg Pts For', value: avgFor, rawValue: avgFor, display: Number(avgFor).toFixed(1) });
      if (avgAgainst !== undefined) items.push({ key: 'avgPointsAgainst', label: 'Avg Pts Against', value: avgAgainst, rawValue: avgAgainst, display: Number(avgAgainst).toFixed(1) });
      if (diff !== undefined) items.push({ key: 'pointDifferential', label: 'Diff', value: diff, rawValue: diff, display: (diff > 0 ? '+' : diff < 0 ? '' : '±') + Number(diff).toFixed(1) });
      if (gamesPlayed !== undefined) items.push({ key: 'gamesPlayed', label: 'Games', value: gamesPlayed, rawValue: gamesPlayed, display: String(gamesPlayed) });
      if (streak !== undefined) items.push({ key: 'streak', label: 'Streak', value: streak, rawValue: streak, display: String(streak) });
      if (playoffSeed !== undefined) items.push({ key: 'playoffSeed', label: 'Seed', value: playoffSeed, rawValue: playoffSeed, display: String(playoffSeed) });
      // Apply exclusion (on 'key')
      return items.filter(i => !props.excludeKeyStats.includes(i.key));
    });

  const filteredRecords = computed(() => [overallRecord.value, homeRecord.value, awayRecord.value].filter((r): r is RecordItem => !!r));

    function prettify(name: string) {
      // Allow label override first
      if (props.statLabelMap[name]) return props.statLabelMap[name];
      return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^avg /i, 'Avg ')
        .replace(/^win Percent$/i, 'Win %')
        .replace(/^OT(.*)/, 'OT $1')
        .replace(/\bPct\b/i, '%')
        .replace(/\b([a-z])/g, s => s.toUpperCase())
        .trim();
    }

    function formatStat(stat: Stat) {
      if (stat.name.toLowerCase().includes('percent')) {
        const num = Number(stat.value);
        return isNaN(num) ? stat.value : (num * 100).toFixed(1) + '%';
      }
      if (typeof stat.value === 'number') {
        return Number(stat.value).toLocaleString();
      }
      return stat.value;
    }

    function valueClass(key: string, value: any) {
      if (key === 'pointDifferential') {
        const num = Number(value);
        return num > 0 ? 'pos' : num < 0 ? 'neg' : 'neu';
      }
      if (key === 'winPercent') {
        const num = Number(value);
        if (num >= 0.6) return 'pos';
        if (num <= 0.4) return 'neg';
        return 'neu';
      }
      return '';
    }

    return { teamData, overallRecord, homeRecord, awayRecord, keyStats, filteredRecords, prettify, formatStat, heroStyle, pointDifferential, signedDifferential, differentialClass, valueClass, props };
  },
});
</script>

<style scoped>
.team-details {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  background: #121212;
  padding: 1.75rem 2rem 2.25rem;
  border-radius: 18px;
  border: 1px solid #2a2a2a;
  box-shadow: 0 4px 18px -4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4) inset;
  color: #e6e6e6;
}

.team-hero {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--team-color,#333), var(--team-alt-color,#555));
  position: relative;
  overflow: hidden;
}
.team-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12), transparent 60%);
  mix-blend-mode: screen;
  pointer-events: none;
}

.logo-wrap {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border-radius: 14px;
  backdrop-filter: blur(2px);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px -2px rgba(0,0,0,0.55);
}

.team-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.team-heading h2 {
  margin: 0 0 .35rem;
  font-size: 2.1rem;
  letter-spacing: .5px;
}
.sub-heading {
  font-size: .95rem;
  opacity: .85;
  margin-bottom: .6rem;
  letter-spacing: .5px;
}

.overall-record-badge {
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.15);
  padding: .45rem .85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: .95rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.overall-record-badge .diff { font-weight: 700; }
.overall-record-badge.pos { box-shadow: 0 0 0 1px #1b5e20; }
.overall-record-badge.neg { box-shadow: 0 0 0 1px #b71c1c; }

.pos { color: #4caf50; }
.neg { color: #ef5350; }
.neu { color: #b0b0b0; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.85rem;
}

.stat-card {
  background: #1e1e1f;
  border: 1px solid #2b2b2d;
  border-radius: 12px;
  padding: .75rem .85rem .9rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  transition: background .25s, transform .25s, border-color .25s;
}
.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08), transparent 70%);
  opacity: 0;
  transition: opacity .3s;
  pointer-events: none;
}
.stat-card:hover { transform: translateY(-3px); border-color: #3a3a3d; }
.stat-card:hover::before { opacity: 1; }
.stat-label { font-size: .65rem; text-transform: uppercase; letter-spacing: .5px; opacity: .7; font-weight: 600; }
.stat-value { font-size: 1.2rem; font-weight: 600; line-height: 1.15; }
.stat-card.pos .stat-value { color: #4caf50; }
.stat-card.neg .stat-value { color: #ef5350; }
.stat-card.neu .stat-value { color: #d0d0d0; }

.progress { width: 100%; height: 6px; background: #2d2d30; border-radius: 4px; overflow: hidden; margin-top: .15rem; }
.progress-bar { height: 100%; background: linear-gradient(90deg,#1976d2,#42a5f5); }

/* Record Cards */
.section-title { margin: 0; font-size: 1.25rem; font-weight: 600; letter-spacing: .5px; }
.record-cards { display: flex; flex-wrap: wrap; gap: 1rem; }
.record-card { flex: 1 1 260px; background: #181818; border: 1px solid #2b2b2d; border-radius: 14px; padding: .95rem 1rem 1.1rem; position: relative; }
.record-card:hover { border-color: #3a3a3d; }
.record-title { margin: 0 0 .4rem; font-size: .95rem; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
.record-summary { font-size: .75rem; background: #262626; padding: .25rem .55rem; border-radius: 999px; border: 1px solid #333; letter-spacing: .5px; }
.record-stats { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: .35rem .5rem; }
.record-stats li { font-size: .7rem; line-height: 1.05rem; display: flex; gap: .25rem; }
.stat-name { opacity: .65; }
.stat-num { font-weight: 600; }

.loading { text-align: center; padding: 2rem 0; opacity: .7; }

@media (max-width: 640px) {
  .team-hero { flex-direction: column; text-align: center; }
  .logo-wrap { width: 160px; height:160px; }
  .team-logo { width: 140px; height:140px; }
  .overall-record-badge { margin: 0 auto; }
  .record-cards { flex-direction: column; }
}
</style>