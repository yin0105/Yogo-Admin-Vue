<template>
  <span class="flex--row">
    <md-field class="flex--50">
      <label>{{ $t('global.Hours') }}</label>
      <md-input v-model="hoursInput" type="number" min="0"></md-input>
    </md-field>
    <md-field class="flex--50">
      <label>{{ $t('global.Minutes') }}</label>
      <md-input v-model="minutesInput" type="number" min="0" max="59"></md-input>
    </md-field>
  </span>
</template>

<script>

  export default {
    name: 'HoursMinutesInput',
    props: ['minutes'],
    data() {
      return {
        hoursInput: 0,
        minutesInput: 0,
      }
    },
    mounted() {
      if (this.minutes) {
        this.hoursInput = Math.floor(this.minutes / 60)
        this.minutesInput = this.minutes % 60
      }
    },
    watch: {
      minutes(newMinutes) {
        this.hoursInput = Math.floor(newMinutes / 60)
        this.minutesInput = newMinutes % 60
      },
      hoursInput(newHoursInput) {
        this.emitChange()
      },
      minutesInput(newMinutesInput) {
        this.emitChange()
      },
    },
    methods: {
      emitChange() {
        const hours = Number.isNaN(this.hoursInput) || !this.hoursInput ? 0 : this.hoursInput;
        const minutes = Number.isNaN(this.minutesInput) || !this.minutesInput ? 0 : this.minutesInput;
        this.$emit('update:minutes', parseInt(hours, 10) * 60 + parseInt(minutes, 10))
      },
    },
  }

</script>
