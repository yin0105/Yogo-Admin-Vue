<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Checkin') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--50">
          <md-field>
            <label>{{ $t('global.ShowClassesThatStart') }}</label>
            <md-select v-model="form.checkin_show_classes_that_start_within">
              <md-option value="rest_of_the_day">{{ $t('global.RestOfTheDay') }}</md-option>
              <md-option value="number_of_minutes">{{ $t('global.WithinSpecificTime') }}</md-option>
            </md-select>
          </md-field>

          <div v-if="form.checkin_show_classes_that_start_within === 'number_of_minutes'">
            <div class="flex--50">
              <HoursMinutesInput v-bind:minutes.sync="form.checkin_show_classes_that_start_within_number_of_minutes"></HoursMinutesInput>
            </div>
          </div>

          <div class="space4"></div>
          <md-field>
            <label>{{ $t('global.ClassesAppearUntil') }}</label>
            <md-select v-model="form.checkin_classes_are_visible_until">
              <md-option value="class_start">{{ $t('global.TheyHaveStarted') }}</md-option>
              <md-option value="class_end">{{ $t('global.TheyHaveEnded') }}</md-option>
              <md-option value="minutes_after_class_start">{{ $t('global.ANumberOfMinutesAfterStart') }}</md-option>
            </md-select>
          </md-field>

          <div v-if="form.checkin_classes_are_visible_until === 'minutes_after_class_start'">
            <md-field>
              <label>{{ $t('global.NumberOfMinutesAfterStart') }}</label>
              <md-input v-model="form.checkin_classes_are_visible_for_minutes_after_start" type="number" min="1"></md-input>
            </md-field>
          </div>

          <div class="space4"></div>

          <div>
            <md-checkbox v-model="form.checkin_direct_customer_to_room_after_checkin">{{ $t('global.AfterCheckinTellCustomerRoomDesc') }}</md-checkbox>
          </div>

        </div>

        <div class="space4"></div>

        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>


    </div>

  </div>

</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"
  import HoursMinutesInput from './form/HoursMinutesInput'

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import _pick from 'lodash/pick'

  import qs from 'qs'

  export default {
    components: {
      LoadingAnimation,
      SettingsSubMenu,
      HoursMinutesInput,
    },
    data() {
      return {
        loading: true,

        form: null,
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {
      const queryParams = {
        keys : [
          'checkin_classes_are_visible_until',
          'checkin_classes_are_visible_for_minutes_after_start',
          'checkin_show_classes_that_start_within',
          'checkin_show_classes_that_start_within_number_of_minutes',
          'checkin_direct_customer_to_room_after_checkin',
        ]
      }
      this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings?' + qs.stringify(queryParams)
      )
      this.loading = false
    },
    methods: {
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'checkin_classes_are_visible_until',
            'checkin_classes_are_visible_for_minutes_after_start',
            'checkin_show_classes_that_start_within',
            'checkin_show_classes_that_start_within_number_of_minutes',
            'checkin_direct_customer_to_room_after_checkin',
          ],
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
