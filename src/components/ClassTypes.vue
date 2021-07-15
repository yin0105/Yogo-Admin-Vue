<template>
  <div class="classtypes">
    <h2>{{ $t('global.ClassTypes') }}</h2>

    <md-button class="md-dense md-primary md-raised" style="margin-left: 0;margin-bottom: 20px; margin-top:-10px;" :to="{
          name: 'SettingsEmail',
          params: { scrollTo: 'classTypeEmails' },
        }">
      {{ $t('global.EmailsOnSignupOrSignoffOrReminder') }}
    </md-button>

    <router-link :to="{ name: 'ClassTypeCreate' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateClassType') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>
    <md-table
      v-model="classTypes"
      md-card v-else @md-selected="onSelectClassType"
      :md-sort.sync="currentSort"
      :md-sort-order.sync="currentSortOrder"
      :md-sort-fn="customSort"
    >
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.Name')" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Color')" md-sort-by="color">
          <div class="color__picker--circle" :style="{background:item.color}"></div>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <p v-else>

      <md-empty-state
          md-icon="fitness_center"
          :md-label="$t('global.CreateClassType')"
          md-description="Ingen klassetyper oprettet endnu.">
        <router-link :to="{name:'ClassTypeCreate'}">
          <md-button class="md-primary md-raised">{{ $t('global.CreateClassType') }}</md-button>
        </router-link>
      </md-empty-state>

    <div class="space8"></div>
  </div>

</template>

<script>

import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';

export default {
  name: 'ClassTypes',
  components: {
    LoadingAnimation,
  },
  data() {
    return {
      loading: true,
      classTypes: [],
      currentSort: 'name',
      currentSortOrder: 'asc',
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
    ]),
  },
  created() {
    if (this.stateReady) this.fetchClassTypes();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchClassTypes();
    },
  },
  methods: {
    fetchClassTypes() {
      YogoApi.get('/class-types')
          .then(response => {
            this.classTypes = response;
            this.loading = false;
          })
          .catch(err => console.log(err));
    },
    onSelectClassType(classType) {
      this.$router.push({
        name: 'ClassTypeEdit',
        params: { id: classType.id },
      });
    },
    customSort (value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort

        if (this.currentSortOrder === 'asc') {
          return a[sortBy].localeCompare(b[sortBy])
        }

        return b[sortBy].localeCompare(a[sortBy])
      })
    },
  },
};
</script>

<style lang="stylus" scoped>

td
  img
    width 40px
    height 40px


</style>
