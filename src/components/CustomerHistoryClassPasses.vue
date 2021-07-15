<template>
  <div>
    <md-table v-model="classPasses">

      <md-table-empty-state
        :md-label="$t('global.NoClassPassesGlobal')"
        md-description="">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.ID')">{{ item.id }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Type')">{{ item.class_pass_type.name }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Start')">{{ dbDateToHumanDate(item.start_date) }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.ValidUntil')">{{ dbDateToHumanDate(item.valid_until)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.ClassesLeft')">{{ item.class_pass_type.pass_type ===
          'fixed_count' ? item.classes_left : '--' }}
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'
  import dateTimeFunctions from '../mixins/dateTimeFunctions'

  export default {
    name: 'CustomerHistoryClassPasses',
    mixins: [dateTimeFunctions],
    props: ['classPasses'],
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
  }
</script>

<style lang="scss" scoped>

  td {
    white-space: nowrap;
  }

</style>
