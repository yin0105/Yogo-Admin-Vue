<template>
  <div>
    <div class="flex__2-1--container">
      <h2>{{ pageTitle }}</h2>
    </div>
    <div class="space4"></div>
    <md-button class="md-raised">
      <router-link :to="{ name: 'PriceGroups' }">{{ $t('global.Back') }}</router-link>
    </md-button>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <md-field class="flex--50" :class="getValidationClass('name')">
        <label>{{ $t('global.PriceGroupName') }}</label>
        <md-input v-model="form.name" required></md-input>
        <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.NameMust') }}</span>
      </md-field>

      <md-checkbox v-model="form.show_in_default_price_list">{{ $t('global.ShowInStandardPriceList') }}</md-checkbox>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ save }}</md-button>
      <md-button class="md-raised md-primary red" v-if="$route.meta.formType === 'edit'" @click="deletePriceGroup">
        {{ $t('global.Delete') }}
      </md-button>

      <div class="space8"></div>

    </div>
  </div>
</template>

<script>

  import Imagefield from "./ImageField.vue"
  import LoadingAnimation from "./LoadingAnimation.vue"
  import YogoApi from '@/gateways/YogoApi'
  import router from '@/router/'
  import {mapGetters} from 'vuex'

  const {required} = require('vuelidate/lib/validators')

  export default {

    components: {
      LoadingAnimation,
      Imagefield,
    },
    name: 'pricegroupform',
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
      ]),
    },
    data() {
      return {
        pageTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditPriceGroup') : this.$t('global.CreatePriceGroup'),
        priceGroupName: 'Prisgruppenavn',
        showInDefaultPriceListLabel: 'Vis i standard prisliste',
        descriptionLabel: 'Beskrivelse',
        deleteLabel: 'Slet prisgruppe',
        save: this.$route.meta.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreatePriceGroup'),

        form: {
          show_in_default_price_list: true,
        },

        loading: this.$route.meta.formType === 'edit',
      }
    },
    created() {
      if (this.$route.meta.formType === 'edit') this.fetchPriceGroup()
    },
    methods: {
      async fetchPriceGroup() {
        try {
          this.form = await YogoApi.get('/price-groups/' + this.$route.params.id)
          this.loading = false

        } catch (err) {
          console.log(err)
        }
      },
      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const saveFields = [
          'name',
          'show_in_default_price_list',
        ]

        const priceGroupData = _.pick(this.form, saveFields)

        if (this.$route.meta.formType === 'edit') {

          await YogoApi.put('/price-groups/' + this.$route.params.id, priceGroupData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: priceGroupData.name + this.$t('global.hasBeenUpdated'),
          })

        }


        if (this.$route.meta.formType === 'add') {

          await YogoApi.post('/price-groups', priceGroupData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: priceGroupData.name + this.$t('global.isCreated'),
          })

        }

        this.$router.push({name: 'PriceGroups'})

      },
      async deletePriceGroup() {
        if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + this.$t('global.IfActiveMembershipsInPriceGroup'))) return

        await YogoApi.delete('/price-groups/' + this.$route.params.id)
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isDeleted'),
        })
        this.$router.push({name: 'PriceGroups'})
      },
      getValidationClass(fieldName) {

        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
    },
    validations: {
      form: {
        name: {
          required,
        },
      },

    },
  }

</script>
