<template>
  <div>
    <md-table v-model="memberships"  @md-selected="onSelectMembership">

      <md-table-empty-state
        :md-label="$t('global.NoMemberships')"
        md-description="">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single" :class="{archived: item.archived, ended: item.status === 'ended'}">
        <md-table-cell :md-label="$t('global.ID')">{{ item.id }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Start')">{{ dbDateToHumanDate(item.start_date) }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Type')">{{ item.membership_type.name }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Status')">{{ item.status_text }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'
  import dateTimeFunctions from '../mixins/dateTimeFunctions'

  export default {
    name: 'CustomerHistoryMemberships',
    mixins: [dateTimeFunctions],
    props: ['memberships'],
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    methods: {
      onSelectMembership(membership) {
        this.$router.push({
          name: 'Membership',
          params: {
            id: membership.id
          }
        })
      },
    }
  }
</script>

<style lang="scss" scoped>

  .md-table-row {
    cursor: pointer;
  }

  .archived {
    background: #E57373;
  }

  .ended {
    background: pink;
  }

  td {
    white-space: nowrap;
  }

</style>
