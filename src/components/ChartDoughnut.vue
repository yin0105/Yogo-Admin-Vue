<script>
import {Pie} from 'vue-chartjs'

export default {
  extends: Pie,
  name: 'chartdoughnut',
  data () {
    return {
      datacollection: {
        labels: false,
        datasets: [
          {
            backgroundColor: ['#2DD1AC', '#01A7C2'],
            data: [92, 8]
          }
        ]
      }
    }
  },
  mounted () {
    this.renderChart(this.datacollection, {responsive: true, maintainAspectRatio: false})
  }
}
</script>
