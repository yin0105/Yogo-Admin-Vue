<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Video') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>

        <h4>{{ $t('global.MainCategories') }}</h4>

        <div class="flex--50">
          <sortable-list-with-add-item-field
              :headers="[$t('global.MainCategory')]"
              :rows="videoMainCategories"
              :add-item-label="$t('global.AddMainCategory')"
              :add-item-helper-text="$t('global.PressEnterToAddMainCategory')"
              @add="addMainCategory"
              @changeSortOrder="mainCategoriesSortOrderChanged"
              @delete="deleteMainCategory"
              @updateRow="updateMainCategory"
          >
            <template v-slot:default="slotProps">
              <yogo-td>{{ slotProps.row.name }}</yogo-td>
            </template>
          </sortable-list-with-add-item-field>
        </div>

        <div class="space8"></div>
        <h4>{{ $t('global.Filters') }}</h4>

        <md-button class="md-fab turkis md-mini md-primary mb-4" :to="{ name: 'VideoFilterAdd' }">
          <md-icon>add</md-icon>
          <md-tooltip md-direction="right">{{ $t('global.CreateFilter') }}</md-tooltip>
        </md-button>

        <div class="md-table md-card md-theme-default">
          <div class="md-content md-table-content md-scrollbar md-theme-default">
            <table>
              <thead>
              <tr>
                <th class="md-table-head">
                  <div class="md-table-head-container">
                    <div class="md-table-head-label">
                      {{ $t('global.Filter') }}
                    </div>
                  </div>
                </th>
                <th class="md-table-head">
                  <div class="md-table-head-container">
                    <div class="md-table-head-label align--right">
                      {{ $t('global.Values') }}
                    </div>
                  </div>
                </th>
                <th class="md-table-head">
                  <div class="md-table-head-container">
                    <div class="md-table-head-label">
                      {{ $t('global.ShowInMoreFilters') }}
                    </div>
                  </div>
                </th>
                <th class="md-table-head" v-if="videoMainCategories.length">
                  <div class="md-table-head-container">
                    <div class="md-table-head-label">
                      {{ $t('global.ShowForMainCategories') }}
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

              <draggable v-model="videoFilters" element="tbody" :options="draggableOptions"
                         @change="onFilterSortOrderChange">
                <tr v-for="item in videoFilters" :key="item.id" md-selectable="single" class="md-table-row"
                    @click="onSelectVideoFilter(item)">
                  <td class="width--100 md-table-cell">
                    <div class="md-table-cell-container">
                      {{ item.name }}
                    </div>
                  </td>
                  <td class="width--100 md-table-cell">
                    <div class="md-table-cell-container" style="white-space: normal;">
                      {{ filterValues(item) }}
                    </div>
                  </td>
                  <td class="width--100 md-table-cell">
                    <div class="md-table-cell-container">
                      <md-icon v-if="item.show_in_more_filters">checkmark</md-icon>
                    </div>
                  </td>
                  <td class="width--100 md-table-cell" v-if="videoMainCategories.length">
                    <div class="md-table-cell-container">
                      {{ videoFilterShowForMainCategoriesText(item) }}
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


      </div>


      <div class="space8"></div>
      <div class="space8"></div>

    </div>

  </div>
</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';
import AddChip from './AddChip';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import draggable from 'vuedraggable';
import SortableListWithAddItemField from '@/components/SortableListWithAddItemField';
import YogoTd from '@/components/ui/YogoTd';

export default {

  name: 'SettingsVideo',

  components: {
    SortableListWithAddItemField,
    SettingsSubMenu,
    LoadingAnimation,
    AddChip,
    draggable,
    YogoTd,
  },

  data() {
    return {
      loading: true,
      draggable,
      draggableOptions: {
        animation: 150,
      },
      form: {},
      videoMainCategories: [],
      videoFilters: [],
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      [
        this.videoMainCategories,
        this.videoFilters,
      ] = await Promise.all([
        YogoApi.get('/video-main-categories'),
        YogoApi.get('/video-filters?populate[]=filter_values&populate[]=show_for_main_categories'),
      ]);
      this.loading = false;
    },
    onSelectVideoFilter(videoFilter) {
      this.$router.push({
        name: 'VideoFilterEdit',
        params: { id: videoFilter.id },
      });
    },
    async onFilterSortOrderChange() {
      await YogoApi.put(
          '/video-filters/sort',
          {
            sortOrder: _.map(this.videoFilters, 'id'),
          },
      );

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.VideoFilterSortOrderHasBeenUpdated'),
      });

    },
    filterValues(videoFilter) {
      return _.map(
          videoFilter.filter_values,
          v => v.name.replace(' ', ' '),
      )
          .join(', ');
    },
    videoFilterShowForMainCategoriesText(videoFilter) {
      if (!videoFilter.show_only_for_specific_main_categories) {
        return this.$t('global.All');
      }
      return _.map(videoFilter.show_for_main_categories, 'name').join(', ')
    },
    async addMainCategory() {

    },
    async deleteMainCategory() {

    },
    async mainCategoriesSortOrderChanged() {

    },
    async updateMainCategory() {

    },
  },

};

</script>
