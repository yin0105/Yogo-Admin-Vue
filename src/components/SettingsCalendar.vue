<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Calendar') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <h4>{{ $t('global.CalendarType') }}</h4>

        <md-field class="flex--50">
          <md-select v-model="form.calendar_layout_type">
            <md-option value="list">{{ $t('global.ListView') }}</md-option>
            <md-option value="timetable">{{ $t('global.TimeTable') }}</md-option>
          </md-select>
        </md-field>

        <div>
          <md-checkbox v-model="form.calendar_show_room">{{ $t('global.ShowRoomInCalendar') }}</md-checkbox>
        </div>

        <h4>{{ $t('global.Filters') }}</h4>

        <md-checkbox v-model="form.calendar_show_teacher_filter">{{ $t('global.ShowTeacherFilter') }}</md-checkbox>
        <md-checkbox v-model="form.calendar_show_classtype_filter">{{ $t('global.ShowClassTypeFilter') }}</md-checkbox>

        <h4>{{ $t('global.ShowClassesPrivateLessonsEvents') }}</h4>
        <md-radio v-model="form.calendar_show_classes_and_events_separately_or_together" value="separately">
          {{ $t('global.Seperate') }}
        </md-radio>
        <md-radio v-model="form.calendar_show_classes_and_events_separately_or_together" value="together">
          {{ $t('global.Together') }}
        </md-radio>

        <h4>{{ $t('global.NumberOfAvailableSpots') }}</h4>

        <md-field>
          <md-select v-model="form.calendar_capacity_info_format">
            <md-option value="available_slash_total_seats">{{ $t('global.ShowTheNumberOfSignUpsAndTheTotalNumberOfSpots') }}</md-option>
            <md-option value="number_of_available_seats">{{ $t('global.ShowNumberOfAvailableSpots') }}</md-option>
            <md-option value="warning_on_few_seats_left">{{ $t('global.ShowWarningOnFewAvailableSpots') }}</md-option>
            <md-option value="none">{{ $t('global.DontShow') }}</md-option>
          </md-select>
        </md-field>

        <md-field v-if="form.calendar_capacity_info_format === 'warning_on_few_seats_left'">
          <label>{{ $t('global.NotificationIsDisplayedNumberOfSpotsLeft') }}</label>
          <md-input v-model="form.calendar_few_seats_left_warning_limit" type="number" min="1"></md-input>
        </md-field>

        <md-field v-if="form.calendar_capacity_info_format === 'warning_on_few_seats_left'">
          <label>{{ $t('global.NotificationText') }}</label>
          <md-input v-model="form.calendar_few_seats_left_warning_text" type="text"></md-input>
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
        '?keys[]=calendar_layout_type' +
        '&keys[]=calendar_show_room' +
        '&keys[]=calendar_show_teacher_filter' +
        '&keys[]=calendar_show_classtype_filter' +
        '&keys[]=calendar_show_classes_and_events_separately_or_together' +
        '&keys[]=calendar_capacity_info_format' +
        '&keys[]=calendar_few_seats_left_warning_text' +
        '&keys[]=calendar_few_seats_left_warning_limit',
      )
      this.loading = false
    },
    methods: {
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'calendar_layout_type',
            'calendar_show_room',
            'calendar_show_teacher_filter',
            'calendar_show_classtype_filter',
            'calendar_show_classes_and_events_separately_or_together',
            'calendar_capacity_info_format',
            'calendar_few_seats_left_warning_text',
            'calendar_few_seats_left_warning_limit',
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
