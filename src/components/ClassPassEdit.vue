<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <p>{{ $t('global.BelongsTo') }}: {{ form.user.first_name + ' ' + form.user.last_name }}</p>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'CustomerInfo', params:{id: form.user.id} }">{{ $t('global.Back') }}</router-link>
      </md-button>

      <div class="space4"></div>

      <div class="flex--row">

        <div class="flex--50">

          <p>
            {{ $t('global.Name') }}: {{ form.class_pass_type.name }}
          </p>
          <p v-if="form.class_pass_type.pass_type === 'fixed_count'">
            {{ $t('global.InitialNumberOfClasses') }}: {{ form.class_pass_type.number_of_classes }}
          </p>


          <md-field :class="getValidationClass('classes_left')" v-if="form.class_pass_type.pass_type === 'fixed_count'">
            <label>{{ $t('global.NumberOfClassesLeft') }}</label>
            <md-input v-model="form.classes_left" type="number" required></md-input>
            <span class="md-error" v-if="!$v.form.classes_left.required">{{
                $t('global.NumberOfClassesIsRequired')
              }}</span>
          </md-field>

          <div :class="getValidationClass('valid_until')">
            <label>{{ $t('global.ValidUntil') }}</label>
            <md-datepicker md-immediately v-model="form.valid_until" class="not-clearable"/>
            <span class="md-error" v-if="!$v.form.valid_until.required">{{ $t('global.EndDateIsRequired') }}</span>
            <span class="md-error"
                  v-if="!$v.form.valid_until.notBeforeToday">{{ $t('global.EndDateCanNotBeEarlierThanToday') }}</span>
          </div>


        </div> <!-- flex--50 -->


      </div>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      <md-button class="md-raised md-primary red" @click="destroy">{{ $t('global.Delete') }}</md-button>
      <div class="space8"></div>

      <h3>{{ $t('global.Log') }}</h3>
      <md-table v-model="form.log_entries" md-card>
        <md-table-row slot="md-table-row" slot-scope="{ item }" :key="item.id">
          <md-table-cell :md-label="$t('global.Date')">{{ item.createdAt | moment('D. MMMM YYYY') }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Time')">{{ item.createdAt | moment('HH:mm:ss') }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Text')">{{ item.entry }}</md-table-cell>
        </md-table-row>
      </md-table>
      <div v-if="form.createdAt < loggingStartedTimestamp">
        {{ $t('log.logNotAvailableBeforeDate', { date: loggingStartedDateFormatted }) }}
      </div>

      <div class="space8"></div>

    </div>
  </div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import Imagefield from './ImageField.vue';
import LoadingAnimation from './LoadingAnimation.vue';
import moment from 'moment';
import dateTimeFunctions from '@/mixins/dateTimeFunctions';

const { required, numeric } = require('vuelidate/lib/validators');

export default {

  components: {
    LoadingAnimation,
    Imagefield,
  },
  name: 'ClassPassFixedCountForm',
  mixins: [dateTimeFunctions],
  data() {
    return {
      form: {
        pass_type: this.passType || 'fixed_count',
      },

      saveLabel: 'Gem',

      //pageTitle: 'Rediger klippekort',

      nameLabel: 'Navn',
      numberOfClassesLabel: 'Antal klip tilbage',
      classesInitiallyLabel: 'Antal klip oprindeligt',
      endDateLabel: 'Slutdato',

      deleteLabel: 'Slet',

      loading: true,

      loggingStartedTimestamp: 1604926800000, // Monday, Nov 9, 14:00:00 GMT+01:00

    };
  },
  computed: {
    pageTitle() {
      return this.form && this.form.class_pass_type && this.form.class_pass_type.pass_type && this.form.class_pass_type.pass_type === 'unlimited' ?
          this.$t('global.EditTimeBasedClassPass') :
          this.$t('global.EditFixedCountClassPass');
    },
    loggingStartedDateFormatted() {
      return this.formatDate(this.loggingStartedTimestamp);
    },
  },

  created: async function () {
    await this.fetchClassPass();
    this.loading = false;
  },

  methods: {
    async fetchClassPass() {
      this.form = await YogoApi.get('/class-passes/' + this.$route.params.id +
          '?populate[]=user' +
          '&populate[]=class_pass_type' +
          '&populate[]=log_entries',
      );
      this.form.valid_until = moment(this.form.valid_until)
          .toDate();
      this.form.log_entries = _.chain(this.form.log_entries)
          .sortBy('createdAt')
          .reverse()
          .value();
    },
    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      let classPassData = {
        valid_until: moment(this.form.valid_until)
            .format('YYYY-MM-DD'),
      };
      if (this.form.class_pass_type.pass_type === 'fixed_count') {
        classPassData.classes_left = this.form.classes_left;
      }


      await YogoApi.put('/class-passes/' + this.$route.params.id, classPassData);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.class_pass_type.name + ' er opdateret',
      });

      this.$router.push({
        name: 'CustomerInfo',
        params: { id: this.form.user.id },
      });

    },

    async destroy() {

      if (!confirm(this.$t('global.WouldYouLikeToDeleteClassPass', { classPassName: this.form.class_pass_type.name }))) return;

      await YogoApi.delete('/class-passes/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.class_pass_type.name + ' er slettet',
      });

      this.$router.push({
        name: 'CustomerInfo',
        params: { id: this.form.user.id },
      });
    },

    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
  },

  validations: {
    form: {
      classes_left: {
        required,
        numeric,
      },
      valid_until: {
        required,
        notBeforeToday(value) {
          return moment(value)
              .isSameOrAfter(moment(), 'day');
        },
      },
    },
  },
};

</script>
