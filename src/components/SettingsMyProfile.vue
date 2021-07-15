<template>
  <div>

    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.CustomerProfile') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <div>
          <md-checkbox v-model="form.frontend_myprofile_show_myactivity">
            {{ $t('global.ShowMyActivity') }}
          </md-checkbox>
        </div>

        <div>
          <md-checkbox v-model="form.customer_profile_use_additional_info_field">
            {{ $t('global.InEditProfileMoreInfo') }}
          </md-checkbox>
        </div>

        <md-field v-if="form.customer_profile_use_additional_info_field">
          <label>
            {{ $t('global.OtherInformationDesc') }}
          </label>
          <md-input v-model="form.customer_profile_additional_info_field_subtitle"></md-input>
        </md-field>

        <div class="mt2">
          <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
        </div>

      </div>

    </div>


  </div>
</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import _pick from 'lodash/pick';
import qs from 'qs';

export default {

  components: {
    SettingsSubMenu,
    LoadingAnimation,
  },

  data() {
    return {
      loading: true,
      form: null,
    };
  },

  computed: {
    ...mapGetters([
      'client',
    ]),
  },

  async created() {
    const queryParams = {
      keys: [
        'frontend_myprofile_show_myactivity',
        'customer_profile_use_additional_info_field',
        'customer_profile_additional_info_field_subtitle',
      ],
    };
    this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings?' + qs.stringify(queryParams),
    );
    this.loading = false;
  },

  methods: {
    async submit() {
      this.loading = true;
      const submitData = _pick(
          this.form,
          [
            'frontend_myprofile_show_myactivity',
            'customer_profile_use_additional_info_field',
            'customer_profile_additional_info_field_subtitle',
          ],
      );
      await YogoApi.put('/clients/' + this.client.id + '/settings', submitData);
      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.SettingsHasBeenUpdated'),
      });

    },
  },

};

</script>
