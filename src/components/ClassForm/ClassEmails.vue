<template>

  <div>
    <h3>{{ $t('global.EmailsToAttendees') }}</h3>
    <md-button type="button" class="md-raised" @click.prevent="createEmail">{{
        $t('global.WriteEmailToAttendees')
      }}
    </md-button>

    <md-table v-model="classEmails" md-sort="send_datetime" md-sort-order="asc" md-card
              v-if="classEmails.length">
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.Subject')">
              <span>
                {{ item.subject | truncateString(40) }}
                <md-tooltip>{{ item.subject }}</md-tooltip>
              </span>
        </md-table-cell>

        <md-table-cell :md-label="$t('global.TimeAsPointInTime')" md-sort-by="send_at_datetime">
          {{
            formatDate(item.send_at_datetime, {
              weekday: true,
              time: true,
              capitalize: true,
            })
          }}
        </md-table-cell>

        <md-table-cell :md-label="$t('global.Sent')" md-sort-by="email_sent">
          <md-icon v-if="item.email_sent">checkmark</md-icon>
          <md-icon v-else>hourglass_top</md-icon>
          <md-tooltip v-if="!item.email_sent">{{ $t('global.WillBeSentAsScheduled') }}</md-tooltip>
          <span v-if="item.email_sent">
            ({{ item.instances.length }})
            <md-tooltip v-if="item.instances.length">{{
                item.instances.map(i => i.recipient.first_name + ' ' + i.recipient.last_name)
                    .join(', ')
              }}</md-tooltip>
          </span>
        </md-table-cell>

        <md-table-cell :md-label="$t('global.SendTo')">
          {{ sendToText(item) }}
        </md-table-cell>

        <md-table-cell :md-label="$t('global.SendToSubsequentSignups')"
                       md-sort-by="send_to_subsequent_signups">
          <AutoSendActiveIndicator
              v-if="item.auto_send_status === 'active' && item.email_sent"></AutoSendActiveIndicator>
          <md-icon v-else-if="item.auto_send_status === 'active'">checkmark</md-icon>
          <span v-else>--</span>
          <md-tooltip v-if="item.auto_send_status === 'active' && item.email_sent">
            {{ $t('global.ActiveSendingToNewSignups') }}
          </md-tooltip>
          <md-tooltip v-else-if="item.auto_send_status === 'active'">{{
              $t('global.AfterSendingSendToSubsequentSignups')
            }}
          </md-tooltip>
        </md-table-cell>

        <md-table-cell>
          <md-button
              @click.prevent="$router.push({name: 'EditClassEmail', params: {emailId: item.id}})"
          >
            {{ $t('global.Edit') }}
          </md-button>
        </md-table-cell>

      </md-table-row>
    </md-table>
  </div>

</template>

<script>

import dateTimeFunctions from '../../mixins/dateTimeFunctions';
import AutoSendActiveIndicator from '@/graphics/AutoSendActiveIndicator';

import { mapGetters } from 'vuex';

export default {
  name: 'ClassEmails',
  components: { AutoSendActiveIndicator },
  props: ['classEmails'],
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  mixins: [dateTimeFunctions],
  methods: {
    createEmail() {
      this.$emit('composeEmail');
    },
    sendToText(email) {
      const recipientGroups = [];
      if (email.send_to_signups) {
        recipientGroups.push(this.client.settings.livestream_enabled ? this.$t('global.AttendeesStudio') : this.$t('global.Attendees'));
      }
      if (email.send_to_livestream_signups) {
        recipientGroups.push(this.$t('global.AttendeesLivestream'));
      }
      if (email.send_to_waiting_list) {
        recipientGroups.push(this.$t('global.Waitlist'));
      }
      return recipientGroups.join(', ');
    },

  },
};

</script>

