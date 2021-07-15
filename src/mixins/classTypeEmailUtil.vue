<template>
  <div></div>
</template>

<script>

import dateTimeFunctions from '@/mixins/dateTimeFunctions';

export default {
  mixins: [dateTimeFunctions],
  methods: {
    classTypeEmailTypeText(email) {
      switch (email.send_at) {
        case 'signup':
          return this.$t('global.AtSignup');
        case 'cancel_booking':
          return this.$t('global.AtCancelBooking');
        case 'minutes_before_class':
          return this.timeIntervalInHumanFormat(email.minutes_before_class) + ' ' + this.$t('global.beforeClass')
              + (email.send_to_subsequent_signups ? ' ' + this.$t('global.plusSubsequentSignups') : '');
      }

    },
  }
}

</script>
