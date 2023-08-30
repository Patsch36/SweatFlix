<template>
  <div class="canvas-box">
    <canvas ref="weightChartEl" height="450px"></canvas>
  </div>
  <p ref="weightRef" v-show="false">{{ weights }}</p>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, nextTick, onMounted } from "vue";
import {
  Chart,
  CategoryScale,
  LineController,
  PointElement,
  LineElement,
  LinearScale,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import WeightRecord from "../datatypes/weight";

onMounted(() => {
  Chart.register(
    CategoryScale,
    LineController,
    PointElement,
    LineElement,
    LinearScale,
    TimeScale
  );
});

const weightChartEl = ref<HTMLCanvasElement | null>(null);
const weightChart = shallowRef<Chart | null>(null);

const { weights } = defineProps(["weights"]);

const weightRef = ref<HTMLElement | null>(null);

const x = ref([]);
const y = ref([]);

watch(
  weights,
  (newWeights) => {
    // const _ws = Array.from(averagedQueryResults());
    // alert("watch");
    const _ws = averagedQueryResults();
    const ws = _ws.sort(
      (a: WeightRecord, b: WeightRecord) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const dataX = ws.map((weight: WeightRecord) =>
      new Date(weight.timestamp).getTime()
    );
    const dataY = ws.map((weight: WeightRecord) => weight.weight);

    x.value = dataX;
    y.value = dataY;
    // alert(dataX);
    // alert(dataY);

    if (weightChart.value) {
      weightChart.value.data.labels = dataX;
      weightChart.value.data.datasets[0].data = dataY;

      weightChart.value.update();
      return;
    }

    nextTick(() => {
      if (weightChartEl.value) {
        const ctx = weightChartEl.value.getContext("2d");
        if (ctx) {
          weightChart.value = new Chart(ctx, {
            type: "line",
            data: {
              labels: dataX,
              datasets: [
                {
                  label: "Weight",
                  data: dataY,
                  backgroundColor: "rgba(147, 30, 21, 0.2)",
                  borderColor: "rgba(147, 30, 21, 1)",
                  borderWidth: 1,
                  fill: true,
                  pointRadius: 1, // Radius der Punkte
                  pointBackgroundColor: "rgba(227,36,0, 0.2)", // Farbe der Punkte
                  pointBorderColor: "rgba(227,36,0, 1)", // Randfarbe der Punkte
                  pointBorderWidth: 1, // Breite des Randes der Punkte
                  tension: 0.4,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "day",
                    stepSize: 1,
                  },
                  grid: {
                    display: true,
                    color: "#222",
                  },
                },
                y: {
                  grid: {
                    color: "#444",
                  },
                },
              },
            },
          });
        }
      }
    });
  },
  { deep: true }
);

// watch(() => weightRef.value?.innerText, (newWeights)
const updateChart = () => {
  // alert("watch");
  if (!weightRef.value?.innerText) return;
  let list = JSON.parse(weightRef.value.innerText);
  console.log(list);
  // const _ws = averagedQueryResults();
  const ws = list.sort(
    (a: WeightRecord, b: WeightRecord) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const dataX = ws.map((weight: WeightRecord) =>
    new Date(weight.timestamp).getTime()
  );
  const dataY = ws.map((weight: WeightRecord) => weight.weight);

  x.value = dataX;
  y.value = dataY;
  // alert(dataX);
  // alert(dataY);

  if (weightChart.value) {
    weightChart.value.data.labels = dataX;
    weightChart.value.data.datasets[0].data = dataY;

    weightChart.value.update();
    return;
  }
};

setInterval(updateChart, 500);

const averagedQueryResults = () => {
  const sortedQueryResults = weights
    .slice()
    .sort(
      (a: WeightRecord, b: WeightRecord) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  const averagedResults: any = [];
  let currentDate = 0;
  let totalWeight = 0;
  let count = 0;

  for (const record of sortedQueryResults) {
    const recordDate = new Date(record.timestamp).getTime();

    if (currentDate === 0) {
      currentDate = recordDate;
      totalWeight = record.weight;
      count = 1;
    } else if (recordDate === currentDate) {
      totalWeight += record.weight;
      count += 1;
    } else {
      averagedResults.push({
        timestamp: currentDate,
        weight: totalWeight / count,
      });
      currentDate = recordDate;
      totalWeight = record.weight;
      count = 1;
    }
  }

  if (count > 0) {
    averagedResults.push({
      timestamp: currentDate,
      weight: totalWeight / count,
    });
  }

  return averagedResults;
};
</script>

<style>
/* .canvas-box {
  width: 100%;
  max-width: 720px;
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
} */
</style>
