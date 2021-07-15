<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.SMS') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <div v-for="message in messages">
          <div class="space4"></div>
          <h4>{{ message.header }}</h4>
          <md-field>
            <label>Besked</label>
            <md-textarea v-model="form[message.field]"></md-textarea>
            <span class="md-helper-text">{{ $t('global.SmsCannotContainLinks') }}</span></md-field>
          <div class="space4"></div>
          <md-button class="md-raised md-primary" @click.prevent="saveMessage(message.field)">{{ $t('global.Save') }}</md-button>
          <div class="space8"></div>
          <hr>
        </div>

      </div>

    </div>
  </div>
</template>

<script>

import SettingsSubMenu from './SettingsSubMenu'
import LoadingAnimation from './LoadingAnimation'
import YogoApi from '@/gateways/YogoApi'
import { mapGetters } from 'vuex'
import _pick from 'lodash/pick'

import qs from 'qs'


export default {
  name: 'SettingsSms',
  components: {
    SettingsSubMenu,
    LoadingAnimation,
  },
  data() {
    return {
      loading: true,
      saveLabel: 'Gem',
      form: {},
      messages: [
        {
          header: this.$t('global.ClassCancelled'),
          field: 'sms_customer_your_class_has_been_cancelled_message',
        },
        {
          header: this.$t('global.CustomerOnWaitlistMovedToClass'),
          field: 'sms_class_waiting_list_customer_moved_from_waiting_list_to_signup',
        },
      ],
    }
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    const settingKeys = _.map(this.messages, 'field');

    this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings?' + qs.stringify({ keys: settingKeys }),
    )
    this.loading = false
  },

  methods: {

    async saveMessage(field) {
      const submitData = {}
      submitData[field] = this.form[field]

      await YogoApi.put('/clients/' + this.client.id + '/settings', submitData)
      this.loading = false

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: 'SMS-beskeden er opdateret',
      })

    },
  },

}

</script>

<style lang="scss">

.md-field textarea.md-textarea {
  height: 250px;
  max-height: none;
}

</style>
