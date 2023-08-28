<template>
  <div class="canvas-box">
    <canvas ref="weightChartEl"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, nextTick, onMounted, watchEffect, computed } from 'vue'
import { Chart, CategoryScale, LinearScale, LineController, PointElement, LineElement } from 'chart.js'
import WeightRecord from '../datatypes/weight'


Chart.register(CategoryScale, LinearScale, LineController, PointElement, LineElement)

const weightChartEl = ref<HTMLCanvasElement | null>(null)
const weightChart = shallowRef<Chart | null>(null)



const { weights } = defineProps<{ weights: WeightRecord[] }>()
watch(
  weights,
  async (newWeights) => {
    // const _ws = Array.from(averagedQueryResults());
    const _ws = averagedQueryResults();
    const ws = _ws.sort((a:WeightRecord, b:WeightRecord) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    if (weightChart.value) {

      weightChart.value.data.labels = ws.map((weight:any) =>
        // new Date(weight.timestamp).toLocaleDateString()
        weight.timestamp
      )
      weightChart.value.data.datasets[0].data = ws.map((weight:any) => weight.weight);

      weightChart.value.update()
      return
    }

    nextTick(() => {

    if (weightChartEl.value) {
      const ctx = weightChartEl.value.getContext('2d')
      if (ctx) {
        weightChart.value = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ws.map((weight:any) =>
              // new Date(weight.timestamp).toLocaleDateString()
              weight.timestamp
            ),
            datasets: [
              {
                label: 'Weight',
                data: ws.map((weight:any) => weight.weight),
                backgroundColor: 'rgba(147, 30, 21, 0.2)',
                borderColor: 'rgba(147, 30, 21, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              grid: {
                color: '#444',
            },
          },
        }
          }
        })
      }
    }
  })
  },
  { deep: true}
)

const averagedQueryResults = () => {
  const sortedQueryResults = weights.slice().sort(
    (a: WeightRecord, b: WeightRecord) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const averagedResults: WeightRecord[] = [];
  let currentDate = '';
  let totalWeight = 0;
  let count = 0;

  for (const record of sortedQueryResults) {
    const recordDate = new Date(record.timestamp).toLocaleDateString();

    if (currentDate === '') {
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
