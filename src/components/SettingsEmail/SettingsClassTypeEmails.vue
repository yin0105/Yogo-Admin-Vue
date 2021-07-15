<template>
  <div>
    <div class="flex space--between flex--row">
      <h4>{{ $t('global.SignupOrSignoffOrReminder') }}</h4>
      <div>
        <md-button class="md-icon-button md-raised turkis" @click.prevent="$router.push({name: 'ClassTypeEmailAdd'})">
          <md-icon>
            <md-icon>add</md-icon>
          </md-icon>
          <md-tooltip md-direction="left">{{ $t('global.CreateEmail') }}</md-tooltip>
        </md-button>
      </div>
    </div>

    <md-table v-model="classTypeEmails" md-card :md-sort.sync="classEmailTableSortField"
              :md-sort-order.sync="classEmailTableSortOrder">
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.Send')" md-sort-by="typeSortText">{{ item.typeText }}</md-table-cell>
        <md-table-cell :md-label="$t('global.ClassTypes')">
          <TableCellMultiLine :items="item.class_types.map(ct => ct.name)"></TableCellMultiLine>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Subject')" md-sort-by="subject">{{
            stringExcerpt(item.subject)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.SendTo')">
          <TableCellMultiLine :items="item.toText.split(', ')"></TableCellMultiLine>
        </md-table-cell>
        <md-table-cell>
          <md-button @click.prevent.stop="$router.push({name: 'ClassTypeEmailEdit',params: {id: item.id}})">
            {{ $t('global.Edit') }}
          </md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

import stringUtils from '@/mixins/stringUtils';
import YogoApi from '@/gateways/YogoApi';
import dateTimeFunctions from '@/mixins/dateTimeFunctions';
import TableCellMultiLine from '@/components/TableCellMultiLine';

import { mapGetters } from 'vuex';
import classTypeEmailUtil from '@/mixins/classTypeEmailUtil';

export default {
  name: 'SettingsClassTypeEmails',
  mixins: [dateTimeFunctions, stringUtils, classTypeEmailUtil],
  components: {
    TableCellMultiLine,
  },
  data() {
    return {
      classTypeEmails: [],
      classEmailTableSortField: 'typeSortText',
      classEmailTableSortOrder: 'asc',
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    this.classTypeEmails = await YogoApi.get('/class-type-emails?populate[]=class_types');
    _.each(this.classTypeEmails, email => {
      email.typeText = this.classTypeEmailTypeText(email);
      email.toText = this.toText(email);
      email.typeSortText = this.typeSortText(email);
    });
  },
  mounted() {
    setTimeout(
        () => {
          this.classEmailTableSortOrder = 'asc';
        },
        100,
    );
  },
  methods: {
    toText(email) {
      const destinations = [];
      if (email.send_to_signups) {
        if (this.client.settings.livestream_enabled) {
          destinations.push(this.$t('global.attendeesStudio'));
        } else {
          destinations.push(this.$t('global.attendees'));
        }
      }
      if (email.send_to_waiting_list) {
        destinations.push(this.$t('global.waitlist'));
      }
      if (email.send_to_livestream_signups) {
        destinations.push(this.$t('global.attendeesLivestream'));
      }
      let toText = destinations.join(', ');
      toText = toText.substr(0, 1)
          .toLocaleUpperCase() + toText.substr(1);
      return toText;
    },
    typeSortText(email) {
      switch (email.send_at) {
        case 'signup':
          return 'a';
        case 'minutes_before_class':
          return 'b' + _.padStart('0', 10, email.minutes_before_class);
        case 'cancel_booking':
          return 'c';
      }
    },
  },
};

</script>
