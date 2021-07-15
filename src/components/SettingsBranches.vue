<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Branches') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>

        <div class="md-table md-card md-theme-default">
          <div class="md-content md-table-content md-scrollbar md-theme-default">
            <table>
              <thead>
              <tr>
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
                      {{ $t('global.Order') }}
                    </div>
                  </div>
                </th>
              </tr>
              </thead>

              <draggable v-model="branches" element="tbody" :options="draggableOptions" @change="onSortOrderChange">
                <tr v-for="item in branches" :key="item.id" md-selectable="single" class="md-table-row"
                    @click="onSelectBranch(item)">
                  <td class="width--100 md-table-cell" :md-label="branchNameLabel">
                    <div class="md-table-cell-container">
                      {{ item.name }}
                    </div>
                  </td>
                  <td class="width--100 md-table-cell" :md-label="reorderLabel">
                    <div class="md-table-cell-container align--right cursor-grab">
                      <md-icon>reorder</md-icon>
                    </div>
                  </td>
                </tr>
              </draggable>
            </table>
          </div>

        </div>

        <p>
          {{ $t('global.CreateNewBranchDesc') }}
        </p>

      </div>

    </div>

  </div>

</template>

<script>

  import draggable from 'vuedraggable'

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import _pick from 'lodash/pick'

  export default {
    name: 'SettingsBranches',
    components: {
      LoadingAnimation,
      SettingsSubMenu,
      draggable: draggable,
    },
    data() {
      return {
        branchNameLabel: 'Navn',

        branches: [],

        draggable,
        draggableOptions: {
          animation: 150,
        },

        reorderLabel: 'Rækkefølge',

        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'client',
        'stateReady',
      ]),
    },
    created() {
      if (this.stateReady) this.fetchBranches()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchBranches()
      },
    },
    methods: {
      async fetchBranches() {
        this.branches = await YogoApi.get('/branches')
        this.loading = false
      },
      onSelectBranch(branch) {
        this.$router.push({name: 'SettingsBranchEdit', params: {id: branch.id}})
      },
      async onSortOrderChange() {
        await YogoApi.put(
          '/branches/sort',
          {
            sortOrder: _.map(this.branches, 'id'),
          },
        )
      },
    },
  }

</script>
