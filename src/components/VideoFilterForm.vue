<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'SettingsVideo' }">{{ $t('global.Back') }}</router-link>
      </md-button>

      <div class="space8"></div>

      <md-field class="flex--50" :class="getValidationClass('form.name')">
        <label>{{ $t('global.FilterName') }}</label>
        <md-input id="video-filter-name-input" type="text" v-model="form.name"></md-input>
        <span class="md-error"
              v-if="!$v.form.name.required">{{
            $t('global.Required')
          }}</span>
      </md-field>

      <md-field class="flex--50">
        <label>{{ $t('global.FilterType') }}</label>
        <md-select v-model="form.filter_type">
          <md-option value="custom">{{ $t('global.Custom') }}</md-option>
          <md-option value="teachers">{{ $t('global.Teachers') }}</md-option>
        </md-select>
      </md-field>

      <div class="space4"></div>
      <SortableListWithAddItemField
          v-if="form.filter_type === 'custom'"
          :title="$t('global.Values')"
          :rows="form.filter_values"
          :headers="[ $t('global.Filter') ]"
          @add="addFilterValue"
          @changeSortOrder="filterValuesSortOrderChanged"
          @delete="deleteFilterValue"
          @updateRow="updateFilterValue"

          :addItemHelperText="$t('global.PressEnterToAddFilterValue')"
          :addItemLabel="$t('global.AddFilterValue')"
          class="mb-8"
      >
        <template v-slot:default="slotProps">
          <yogo-td>{{ slotProps.row.name }}</yogo-td>
        </template>
      </SortableListWithAddItemField>

      <div class="space8" v-if="form.filter_type === 'custom'"
      ></div>

      <md-checkbox v-model="form.show_in_more_filters">{{ $t('global.ShowInMoreFilters') }}</md-checkbox>

      <div class="space8"></div>

      <md-checkbox v-model="form.show_only_for_specific_main_categories" v-if="mainCategories.length">
        {{ $t('global.ShowOnlyForSpecificMainCategories') }}
      </md-checkbox>

      <md-field class="flex--50" v-if="mainCategories.length && form.show_only_for_specific_main_categories">
        <label>{{ $t('global.ShowForMainCategories') }}</label>
        <md-select v-model="form.show_for_main_categories" multiple>
          <md-option v-for="mainCategory in mainCategories" :value="mainCategory.id">
            {{ mainCategory.name }}
          </md-option>
        </md-select>
      </md-field>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveButtonText }}</md-button>
      <md-button
          class="md-raised md-primary red"
          v-if="formType === 'edit'"
          @click="deleteVideoFilter">
        {{ $t('global.Delete') }}
      </md-button>

      <div class="space8"></div>
      <div class="space8"></div>
    </div>
  </div>
</template>

<script>
import SortableListWithAddItemField from '@/components/SortableListWithAddItemField';
import YogoTd from '@/components/ui/YogoTd';
import YogoApi from '@/gateways/YogoApi';
import SettingsSubMenu from '@/components/SettingsSubMenu';
import qs from 'qs';

const { required } = require('vuelidate/lib/validators');

export default {
  name: 'VideoFilterForm',
  data() {
    return {

      mainCategories: [],

      form: {
        name: '',
        filter_type: 'custom',
        filter_values: [],
        show_in_more_filters: false,
      },

    };
  },
  computed: {
    formType() {
      return this.$route.meta.formType;
    },
    pageTitle() {
      return this.formType === 'edit' ? this.$t('global.EditVideoFilter') : this.$t('global.CreateVideoFilter');
    },
    saveButtonText() {
      return this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateVideoFilter');
    },
  },
  created() {
    this.fetchMainCategories();
    if (this.formType === 'edit') {
      this.fetchVideoFilter();
    }
  },
  mounted() {
    if (this.formType === 'add') {
      document.querySelector('#video-filter-name-input')
          .select();
    }
  },
  methods: {
    async fetchMainCategories() {
      this.mainCategories = await YogoApi.get('/video-main-categories');
    },
    async fetchVideoFilter() {
      const queryString = qs.stringify({
        populate: [
          'filter_values',
          'show_for_main_categories'
        ]
      })
      this.form = await YogoApi.get(`/video-filters/${this.$route.params.id}?${queryString}`);
      this.form.show_for_main_categories = _.map(this.form.show_for_main_categories, 'id');
    },
    async submit() {

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      let videoFilterData = _.pick(this.form,
          [
            'name',
            'filter_type',
            'show_in_more_filters',
            'show_only_for_specific_main_categories',
            'show_for_main_categories',
          ]
      );

      if (this.form.filter_type === 'custom') {
        videoFilterData.filter_values = this.form.filter_values;
      }

      if (!videoFilterData.show_only_for_specific_main_categories) {
        videoFilterData.show_for_main_categories = [];
      }

      if (this.formType === 'add') {
        await YogoApi.post('/video-filters', videoFilterData);
      } else {
        await YogoApi.put(`/video-filters/${this.form.id}`, videoFilterData);
      }

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.formType === 'edit' ? this.$t('global.VideoFilterHasBeenUpdated') : this.$t('global.VideoFilterHasBeenCreated'),
      });

      this.$router.push({ name: 'SettingsVideo' });

    },
    async deleteVideoFilter() {
      if (!confirm(this.$t('global.WouldYouLikeToDeleteThisVideoFilter'))) return;

      await YogoApi.delete('/video-filters/' + this.form.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.VideoFilterHasBeenDeleted'),
      });

      this.$router.push({ name: 'SettingsVideo' });
    },
    filterValuesSortOrderChanged(newFilterValues) {
      console.log(newFilterValues);
      this.form.filter_values = newFilterValues;
    },
    addFilterValue(value) {
      this.form.filter_values.push({ name: value });
    },
    deleteFilterValue(idx) {
      this.form.filter_values.splice(idx, 1);
    },
    updateFilterValue(idx, value) {
      this.form.filter_values[idx].name = value;
    },
    getValidationClass(fieldPath) {
      const field = _.get(this.$v, fieldPath);
      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
  },
  components: {
    YogoTd,
    SortableListWithAddItemField,
    SettingsSubMenu,
  },
  validations: {
    form: {
      name: { required },
    },
  },
};
</script>
