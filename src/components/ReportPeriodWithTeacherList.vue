<template>

  <div class="flex flex-wrap">

    <!-- <md-field class="flex--25 mr10-md min-h-14">
      <label>{{ $t('global.Period') }}</label>
      <md-select v-model="inputPeriodType">
        <md-option value="year">{{ $t('global.Year') }}</md-option>
        <md-option value="month">{{ $t('global.Month') }}</md-option>
        <md-option value="day">{{ $t('global.Day') }}</md-option>
        <md-option value="custom">{{ $t('global.Custom') }}</md-option>
      </md-select>
    </md-field>

    <md-field class="flex--25 mr10-md min-h-14"
              v-if="inputPeriodType === 'year' || inputPeriodType === 'month'">
      <label>{{ $t('global.Year') }}</label>
      <md-select v-model="inputYear">
        <md-option v-for="year in years" :value="year" :key="'year_' + year">
          {{ year }}
        </md-option>
      </md-select>
    </md-field>

    <md-field class="flex--25 mr10-md min-h-14" v-if="inputPeriodType === 'month'">
      <label>{{ $t('global.Month') }}</label>
      <md-select v-model="inputMonth">
        <md-option v-for="(monthName, month) in months" :value="month" :key="'month_' + month">
          {{ monthName }}
        </md-option>
      </md-select>
    </md-field> -->

    <div class="flex--25 mr10-md min-h-14">
      <label>{{ $t('global.FromDate') }}</label>
      <datepicker v-model="fromDate" :monday-first="true"></datepicker>
    </div>


    <div class="flex--25">
      <label>{{ $t('global.EndDate') }}</label>
      <datepicker v-model="endDate" :monday-first="true"></datepicker>
    </div>

    <div class="flex--25">
      <label>{{ $t('global.Teacher') }}</label>
      <YogoTreeselectTeacher></YogoTreeselectTeacher>
      
    </div>

  </div>

</template>

<script>

  import Datepicker from 'vuejs-datepicker'
  import moment from 'moment'
  import YogoTreeselectTeacher from '@/components/ui/YogoTreeselectTeacher';

  export default {
    components: {
      Datepicker,
      YogoTreeselectTeacher
    },
    name: 'reportperiodwithteacherlist',
    data() {
      return {
        // inputPeriodType: this.periodType,
        // inputYear: this.year,
        // inputMonth: this.month,
        // inputDate: this.fromDate,
        // inputEndDate: this.endDate
      }
    },
    watch: {
      // inputPeriodType(newPeriodType) {
      //   this.$emit('update:periodType', newPeriodType)
      // },
      // inputYear(newYear) {
      //   this.$emit('update:year', newYear)
      // },
      // inputMonth(newMonth) {
      //   this.$emit('update:month', newMonth)
      // },
      // fromDate(newFromDate) {
      //   this.$emit('update:fromDate', newFromDate)
      // },
      endDate(newEndDate) {
        this.$emit('update:endDate', newEndDate)
      },
    },
    props: {
      // periodType: {
      //   default: 'year',
      // },
      // year: {
      //   default: moment().year(),
      // },
      // month: {
      //   default: moment().month(),
      // },
      // date: {
      //   default: new Date(),
      // },
      // endDate: {
      //   default: new Date(),
      // },
    },
    computed: {
      years() {
        const currentYear = moment().year()
        const firstYear = Math.max(2018, currentYear - 9)
        return _.range(currentYear, firstYear - 1)
      },
      months() {
        const months = []
        for (var i = 0; i <= 11; i++) {
          months.push(
            _.upperFirst(
              moment().month(i).format('MMMM'),
            ),
          )
        }
        return months
      }, 
      fromDate: {
        get: function() {
          const today = new Date();
          let yy = today.getFullYear();
          let mm = today.getMonth() - 1;

          if (mm < 0) {
            mm += 12;
            yy -= 1;
          }

          return new Date(yy, mm, 1);
        }, 
        set: function(date) {
          console.log("fromDate: set, ", date);
          this.$emit('update:fromDate', date);
        }
      },
      endDate: {
        get: function() {
          const today = new Date();
          let yy = today.getFullYear();
          let mm = today.getMonth();

          return new Date(yy, mm, 0);
        },
        set: function(date) {
          console.log("endDate: set, ", date);
          this.$emit('update:endDate', date);
        }
      }
    },

    created() {
      console.log("created: ", this.fromDate);
      
    },
    mounted() {
      console.log("mounted: ", this.fromDate);
      this.$emit('update:fromDate', this.fromDate);
      this.$emit('update:endDate', this.endDate);
    }
  }

</script>
