<template>
  <div>

    <h2>{{ $t('global.Reports') }}</h2>

    <div class="flex--row">
      <md-field class="flex--25">
        <label>Type</label>
        <md-select v-model="reportType">
          <md-option value="turnover">Omsætning</md-option>
          <md-option value="orders">Enkelte salg</md-option>
          <!--<md-option value="attendance">Fremmøde</md-option>-->
        </md-select>
      </md-field>
    </div>

    <ReportOrders v-if="reportType === 'orders'"></ReportOrders>
    <ReportTurnover v-if="reportType === 'turnover'"></ReportTurnover>




  </div>

</template>

<script>

  import ReportOrders from './ReportOrders'
  import ReportTurnover from './ReportTurnover'

  export default {
    components: {ReportOrders, ReportTurnover},
    name: 'reports',
    data() {
      return {

        reportType: 'turnover',

      }
    },
    computed: {

    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchData()
      },
    },
    created() {
      if (this.stateReady) this.fetchData()
    },
    mounted: function () {

    },
    methods: {

    },
  }
</script>


<style lang="stylus">


</style>
