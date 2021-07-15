<template>
  <div class="eventgroups">
    <h2>{{ $t('global.EventGroups') }}</h2>

    <router-link :to="{ name: 'EventGroupAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateEventGroup') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>

    <div class="md-table md-card md-theme-default" v-else>
      <div class="md-content md-table-content md-scrollbar md-theme-default">
        <table>
          <thead>
          <tr>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label">
                  {{ $t('global.ID') }}
                </div>
              </div>
            </th>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label">
                  {{ $t('global.Name') }}
                </div>
              </div>
            </th>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label align--right">
                  {{ $t('global.Color') }}
                </div>
              </div>
            </th>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label align--right">
                  {{ $t('global.Order') }}
                </div>
              </div>
            </th>
          </tr>
          </thead>

          <draggable v-model="eventGroups" element="tbody" :options="draggableOptions" @change="onSortOrderChange">
            <tr v-for="item in eventGroups" :key="item.id" md-selectable="single" class="md-table-row"
                @click="onSelectEventGroup(item)">
              <td class="md-table-cell">
                <div class="md-table-cell-container">
                  {{ item.id }}
                </div>
              </td>
              <td class="width--100 md-table-cell">
                <div class="md-table-cell-container">
                  {{ item.name }}
                </div>
              </td>
              <td class="width--100 md-table-cell">
                <div class="md-table-cell-container">
                  <div class="color__picker--circle" :style="{background:item.color}"></div>
                </div>
              </td>
              <td class="width--100 md-table-cell">
                <div class="md-table-cell-container align--right cursor-grab">
                  <md-icon>reorder</md-icon>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>

    <div class="space8"></div>
  </div>

</template>

<script>


  import draggable from 'vuedraggable'
  import LoadingAnimation from "./LoadingAnimation.vue"
  import YogoApi from '@/gateways/YogoApi'
  import router from '@/router/'
  import {mapGetters} from 'vuex'

  export default {
    name: 'eventgroups',
    components: {
      LoadingAnimation,
      draggable: draggable,
    },
    data() {
      return {
        pageTitle: 'Kursusgrupper',

        eventGroupNameLabel: 'Navn',
        reorder: 'Rækkefølge',
        draggable,
        draggableOptions: {
          animation: 150,
        },

        eventGroups: [],

        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
      ]),
    },
    created() {
      if (this.stateReady) this.fetchEventGroups()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchEventGroups()
      },
    },
    methods: {
      async fetchEventGroups() {
        this.eventGroups = await YogoApi.get('/event-groups')
        this.loading = false
      },
      onSelectEventGroup(eventGroup) {
        this.$router.push({name: 'EventGroupEdit', params: {id: eventGroup.id}})
      },
      async onSortOrderChange() {
        await YogoApi.put(
          '/event-groups/sort',
          {
            sortOrder: _.map(this.eventGroups, 'id'),
          },
        )
      },
    },
  }
</script>
