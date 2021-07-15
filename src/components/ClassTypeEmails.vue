<template>

  <div>
    <h2>{{ $t('global.ClassTypeEmails') }}</h2>

    <md-button type="button" class="md-raised" :to="{name: 'ClassTypeEmailCreate'}">{{ $t('global.Create') }} {{ $t('global.classTypeEmail') }}</md-button>

    <md-table v-model="classTypeEmails" md-sort="send_at" md-sort-order="asc" md-card
              v-if="classTypeEmails.length">
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.Subject')">
              <span>
                {{ item.subject | truncateString(40) }}
                <md-tooltip>{{ item.subject }}</md-tooltip>
              </span>
        </md-table-cell>

        <md-table-cell :md-label="$t('global.Send')" md-sort-by="send_at">
          {{ sendAtText(item) }}
        </md-table-cell>

        <md-table-cell :md-label="$t('global.SendTo')">
          {{ sendToText(item) }}
        </md-table-cell>

        <md-table-cell>
          <md-button
              @click.prevent="$router.push({name: 'ClassTypeEmailEdit', params: {emailId: item.id}})"
          >
            {{ $t('global.Edit') }}
          </md-button>
        </md-table-cell>

      </md-table-row>
    </md-table>
  </div>

</template>

<script>

  import dateTimeFunctions from '../mixins/dateTimeFunctions'
  import AutoSendActiveIndicator from '@/graphics/AutoSendActiveIndicator';

  export default {
    name: 'ClassTypeEmails',
    components: { },
    methods: {
      senAtText(email) {
        let text = '';
        switch (email.send_at) {
          case 'signup':
            text += this.$t('global.AtSignup')
            break;
          case 'waiting_list_signup':
            text += this.$t('global.AtSignupForWaitlist')
            break;
          case 'minutes_before_class':
            text += email.send_at_minutes_before_class_start + this.$t('global.minutes') + ' ' + this.$t('global.beforeClassStart')
              if (email.send_to_subsequent_signups) {
                text += ' ' + this.$t('global.SendToSubsequentSignups')
              }
            break;
        }
      },
      sendToText(email) {
        const recipientGroups = []
        if (email.send_to_studio_signups) {
          recipientGroups.push(this.$t('global.Attendees'));
        }
        if (email.send_to_livestream_signups) {
          recipientGroups.push(this.$t('global.LivestreamAttendees'));
        }
        if (email.send_to_waiting_list) {
          recipientGroups.push(this.$t('global.Waitlist'))
        }
        return recipientGroups.join(', ')
      },

    },
  }

</script>

