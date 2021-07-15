<template>
  <div>
    <h2>{{ $t('global.PriceGroups') }}</h2>

    <router-link :to="{ name: 'PriceGroupAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreatePriceGroup') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>

    <div class="md-table md-card md-theme-default" v-else-if="priceGroups.length">
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
                <div class="md-table-head-label">
                  {{ $t('global.ShowInStandardPriceList') }}
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

          <draggable v-model="priceGroups" element="tbody" :options="draggableOptions" @change="onSortOrderChange">
            <tr v-for="item in priceGroups" :key="item.id" md-selectable="single" class="md-table-row"
                @click="onSelectPriceGroup(item)">
              <td class="width--100 md-table-cell" :md-label="$t('global.Name')">
                <div class="md-table-cell-container">
                  {{ item.name }}
                </div>
              </td>
              <td class="width--100 md-table-cell">
                <div class="md-table-cell-container">
                  <md-icon v-if="item.show_in_default_price_list">checkmark</md-icon>
                </div>
              </td>
              <td class="width--100 md-table-cell" :md-label="$t('global.Order')">
                <div class="md-table-cell-container align--right cursor-grab">
                  <md-icon>reorder</md-icon>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>

    <div v-else>
      {{ $t('global.NoPriceGroups') }}<br><br>
      <router-link :to="{name: 'PriceGroupAdd'}">
        {{ $t('global.CreatePriceGroup') }}
      </router-link>
    </div>

    <div class="space8"></div>
  </div>

</template>

<script>


import draggable from 'vuedraggable';
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';

export default {
  name: 'PriceGroups',
  components: {
    LoadingAnimation,
    draggable: draggable,
  },
  data() {
    return {

      draggable,
      draggableOptions: {
        animation: 150,
      },

      priceGroups: [],

      loading: true,
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'stateReady',
    ]),
  },
  created() {
    if (this.stateReady) this.fetchPriceGroups();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchPriceGroups();
    },
  },
  methods: {
    async fetchPriceGroups() {
      this.priceGroups = await YogoApi.get('/price-groups');
      this.loading = false;
    },
    onSelectPriceGroup(priceGroup) {
      this.$router.push({
        name: 'PriceGroupEdit',
        params: { id: priceGroup.id },
      });
    },
    async onSortOrderChange() {
      await YogoApi.put(
          '/price-groups/sort',
          {
            sortOrder: _.map(this.priceGroups, 'id'),
          },
      );
    },
  },
};
</script>
