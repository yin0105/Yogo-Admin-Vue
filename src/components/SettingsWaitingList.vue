<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Waitlist') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <h4>{{ $t('global.WaitListForClasses') }}</h4>

        <div>
          <md-checkbox v-model="form.class_waiting_list_enabled">
            {{ $t('global.UseWaitListForClasses') }}
          </md-checkbox>
        </div>

        <md-field v-if="form.class_waiting_list_enabled">
          <label>{{ $t('global.MaxPersonsOnWaitListForClasses') }}</label>
          <md-input v-model="form.class_waiting_list_max_customers_on_waiting_list" type="number" min="1"></md-input>
        </md-field>

        <h4>{{ $t('global.WaitListForPrivateLessons') }}</h4>

        <div>
          <md-checkbox v-model="form.private_class_waiting_list_enabled">
            {{ $t('global.UseWaitListForPrivateLessons') }}
          </md-checkbox>
        </div>

        <md-field v-if="form.private_class_waiting_list_enabled">
          <label>{{ $t('global.MaxPeopleOnWaitListForPrivateLessons') }}</label>
          <md-input v-model="form.private_class_waiting_list_max_customers_on_waiting_list" type="number" min="1"></md-input>
        </md-field>

      </div>

      <div class="mt2">
        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>

      <div class="space8"></div>
      <div class="space8"></div>

    </div>

  </div>
</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"
  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'
  import _pick from 'lodash/pick'

  export default {

    components: {
      SettingsSubMenu,
      LoadingAnimation,
    },

    data() {
      return {
        loading: true,
        form: {},
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {
      this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=class_waiting_list_enabled' +
        '&keys[]=class_waiting_list_max_customers_on_waiting_list' +
        '&keys[]=private_class_waiting_list_enabled' +
        '&keys[]=private_class_waiting_list_max_customers_on_waiting_list'
      )
      this.loading = false
    },
    methods: {
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'class_waiting_list_enabled',
            'class_waiting_list_max_customers_on_waiting_list',
            'private_class_waiting_list_enabled',
            'private_class_waiting_list_max_customers_on_waiting_list',],
        )
        await YogoApi.put('/clients/' + this.client.id + '/settings', submitData)
        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.SettingsHasBeenUpdated'),
        })

      },
    },

  }

</script>
