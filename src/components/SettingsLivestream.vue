<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Livestream') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div v-if="form.livestream_enabled" class="flex--50">
          <md-field>
            <label>{{ $t('global.SendEmailMinutesBeforeClassStart') }}</label>
            <md-input v-model="form.livestream_send_email_to_customers_minutes_before_class_start"
                      type="number" min="1"></md-input>
          </md-field>

          <md-field
            :class="getValidationClass('form.livestream_email_to_customers_before_class_start_subject')">
            <label>{{ $t('global.EmailSubject') }}</label>
            <md-input v-model="form.livestream_email_to_customers_before_class_start_subject"
                      type="text" required></md-input>
            <span
              class="md-error"
              v-if="!$v.form.livestream_email_to_customers_before_class_start_subject.required"
            >
              {{ $t('global.SubjectMust') }}
            </span>
          </md-field>

          <md-field
            :class="getValidationClass('form.livestream_email_to_customers_before_class_start_body')">
            <label>{{ $t('global.EmailText') }}</label>
            <md-textarea v-model="form.livestream_email_to_customers_before_class_start_body"
                         required></md-textarea>
            <span
              class="md-error"
              v-if="!$v.form.livestream_email_to_customers_before_class_start_body.required"
            >
              {{ $t('global.EmailTextMust') }}
            </span>
          </md-field>

          <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>

        </div>
        <div v-else>
          <md-button
            class="md-raised md-primary"
            @click.prevent="showLivestreamConditionsDialog = true"
          >
            {{ $t('global.ActivateLivestream') }}
          </md-button>
        </div>

      </div>

    </div>

    <md-dialog :md-active.sync="showLivestreamConditionsDialog">
      <md-dialog-title>{{ $t('global.ActivateLivestream') }}</md-dialog-title>
      <md-dialog-content>
        <p>
          {{ $t('global.ActivateLivestreamDesc1') }}
        </p>
        <!--<p>
          {{ $t('global.ActivateLivestreamDesc2') }}
        </p>
        <p>
          {{ $t('global.ActivateLivestreamDesc3') }}
        </p>-->
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-raised" @click="showLivestreamConditionsDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button class="md-raised md-primary" @click="enableLivestream">
          {{ $t('global.ActivateLivestream') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showConfirmLivestreamEnabledDialog">
      <md-dialog-title>
        {{ $t('global.LivestreamActivated') }}
      </md-dialog-title>
      <md-dialog-content>
        <p>
          {{ $t('global.LivestreamActivatedDesc1') }}
        </p>
        <!--<p>
          {{ $t('global.YouCanAlwaysFollowYourConsumption') }}
          <router-link :to="{name: 'ReportLivestream'}">{{ $t('global.LivestreamReport') }}</router-link>
        </p>-->
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary md-raised"
                   @click.prevent="showConfirmLivestreamEnabledDialog = false">Ok
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>

</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from './LoadingAnimation'

  import YogoApi from '@/gateways/YogoApi'
  import { mapGetters } from 'vuex'
  import _pick from 'lodash/pick'

  const { required } = require('vuelidate/lib/validators')


  export default {
    components: {
      LoadingAnimation,
      SettingsSubMenu,
    },
    data() {
      return {
        loading: true,
        form: {},

        saveLabel: 'Gem',

        showLivestreamConditionsDialog: false,
        showConfirmLivestreamEnabledDialog: false,

      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {
      await this.getSettings()
      this.loading = false
    },
    methods: {

      async getSettings() {
        this.form = await YogoApi.get(
          '/clients/' + this.client.id + '/settings' +
          '?keys[]=livestream_enabled' +
          '&keys[]=livestream_send_email_to_customers_minutes_before_class_start' +
          '&keys[]=livestream_email_to_customers_before_class_start_subject' +
          '&keys[]=livestream_email_to_customers_before_class_start_body',
        )
      },

      async enableLivestream() {
        this.loading = true
        this.showLivestreamConditionsDialog = false
        await YogoApi.put('/clients/' + this.client.id + '/settings', {
          livestream_enabled: true,
        })
        this.$store.commit('updateClientSetting', {
          key: 'livestream_enabled',
          value: true,
        })
        await this.getSettings()
        this.loading = false
        this.showConfirmLivestreamEnabledDialog = true
      },

      async submit() {
        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'livestream_send_email_to_customers_minutes_before_class_start',
            'livestream_email_to_customers_before_class_start_subject',
            'livestream_email_to_customers_before_class_start_body',
          ],
        )
        await YogoApi.put('/clients/' + this.client.id + '/settings', submitData)

        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.SettingsHasBeenUpdated'),
        })

      },
      getValidationClass(fieldPath) {

        const field = _.get(this.$v, fieldPath)

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
    },

    validations: {
      form: {
        livestream_send_email_to_customers_minutes_before_class_start: {
          required,
        },
        livestream_email_to_customers_before_class_start_subject: {
          required,
        },
        livestream_email_to_customers_before_class_start_body: {
          required,
        },
      },
    },
  }

</script>
