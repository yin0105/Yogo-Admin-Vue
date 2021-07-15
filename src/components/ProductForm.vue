<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'Products' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex--row align__items--center">

        <md-field class="flex--50" :class="getValidationClass('name')">
          <label>{{ $t('global.Name') }}</label>
          <md-input v-model="form.name" required></md-input>
          <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.ProductNameMust') }}</span>
        </md-field>

        <div class="space8"></div>
        <div class="space4"></div>

        <imagefield class="flex--50" imageFormat="square" :imageId.sync="form.image_id"></imagefield>

      </div>


      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('price')">
          <label>{{ $t('global.Price') }}</label>
          <md-input v-model="form.price" required type="number"></md-input>
          <span class="md-error" v-if="!$v.form.price.required">{{ $t('global.ProductPriceMust') }}</span>
        </md-field>

      </div>

      <div class="flex--row">
        <div class="flex--50">
          <md-checkbox v-model="form.for_sale">{{ $t('global.ForSale') }}</md-checkbox>
        </div>
      </div>


      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
      <md-button class="md-raised md-primary red" v-if="$route.meta.formType === 'edit'" @click="deleteProduct">
        {{ $t('global.Delete') }}
      </md-button>


    </div>
    <div class="space8"></div>
  </div>
</template>

<script>
  import ParticipantList from './ParticipantList'
  import Imagefield from "./ImageField.vue"
  import moment from 'moment'
  import YogoApi from '@/gateways/YogoApi'
  import LoadingAnimation from "./LoadingAnimation.vue"
  import {mapGetters} from 'vuex'

  import AutoFormatTime from '../auto-formatters/time'

  import avatar from '@/graphics/avatar'

  const {required, minLength} = require('vuelidate/lib/validators')

  export default {
    name: 'productform',
    components: {
      LoadingAnimation,
      Imagefield,
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
    },
    data() {
      return {
        pageTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditProduct') : this.$t('global.CreateProduct'),
        titleLabel: 'Navn',

        price: 'Pris',
        forSaleLabel: 'Til salg nu',

        saveLabel: this.$route.meta.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateProduct'),

        deleteProductLabel: 'Slet vare',

        form: {
          for_sale: true,
        },

        loading: true,
      }
    },
    async created() {
      if (this.stateReady && !this.initialized) {
        this.init()
      }
    },

    watch: {
      stateReady(newReadyState) {
        if (!this.initialized) {
          this.init()
        }
      },
    },

    methods: {

      async init() {
        this.initialized = true

        if (this.$route.meta.formType === 'edit') {
          this.fetchProduct()
        } else {
          this.loading = false
        }
      },

      async fetchProduct() {
        this.form = (await YogoApi.get(
          '/products?id=' + this.$route.params.id
        ))[0]
        this.form.for_sale = !!this.form.for_sale
        this.loading = false
      },


      async submit() {
        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        let productData = _.pick(this.form, [
          'name',
          'price',
          'for_sale',
        ])

        productData.image = this.form.image_id

        if (this.$route.meta.formType === 'edit') {
          await YogoApi.put('/products/' + this.$route.params.id, productData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.hasBeenUpdated'),
          })
        }

        if (this.$route.meta.formType === 'add') {

          await YogoApi.post('/products', productData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.isCreated'),
          })

        }

        this.$router.push({
          name: 'Products',
        })

      },

      getValidationClass(fieldName) {

        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      async deleteProduct() {

        if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + '?')) {
          return
        }

        this.loading = true
        await YogoApi.delete('/products/' + this.$route.params.id)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isDeleted'),
        })

        this.$router.push({
          name: 'Products',
        })

      },
      avatar() {
        return avatar
      },
    },

    validations: {

      form: {
        name: {
          required,
        },
        price: {
          required,
        },
      },
    },

  }

</script>
