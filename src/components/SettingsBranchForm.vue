<template>
  <div>
    <div class="flex__2-1--container">
      <h2>{{ customerInfoTitle }}</h2>
    </div>
    <md-button class="md-raised">
      <router-link :to="{ name: 'SettingsBranches' }">Tilbage</router-link>
    </md-button>

    <div>
      <md-field class="flex--50" :class="getValidationClass('name')">
        <label class="active">{{ branchNameLabel }}</label>
        <md-input required v-model="form.name" ref="branchNameInput"></md-input>
        <span class="md-error" v-if="!$v.form.name.required">Afdelingens navn skal indtastes</span>
      </md-field>

      <div class="space4"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>

      <div class="space8"></div>
    </div>
  </div>

</template>

<script>

  import LoadingAnimation from "./LoadingAnimation.vue"
  import YogoApi from '../gateways/YogoApi'
  import {mapGetters} from 'vuex'

  const {required, minLength} = require('vuelidate/lib/validators')

  export default {
    // This component is NOT yet working in "add" mode
    name: 'branchform',
    components: {},
    data() {
      return {
        customerInfoTitle: this.$route.meta.formType === 'edit' ? 'Rediger afdeling' : 'Opret afdeling',
        form: {},
        branchLabel: 'Afdeling',
        branchNameLabel: 'Afdelingens navn',
        deleteBranchLabel: 'Slet afdeling',
        saveLabel: this.$route.meta.formType === 'edit' ? 'Gem afdeling' : 'Opret afdeling',

      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
      ]),
    },
    mounted() {
      if (this.$route.meta.formType === 'add') this.$refs.branchNameInput.$el.focus()
    },
    methods: {
      async fetchBranch() {
        this.form = await YogoApi.get('/branches/' + this.$route.params.id)
      },
      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const branchData = _.pick(this.form, [
          'name',
        ])

        if (this.$route.meta.formType === 'edit') {

          await YogoApi.put('/branches/' + this.$route.params.id, branchData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: branchData.name + ' er opdateret',
          })

        } else {

          await YogoApi.post('/branchess', branchData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + ' er oprettet',
          })

        }

        this.$router.push({name: 'SettingsBranches'})


      },


      async deleteBranch() {
        if (!confirm('Er du sikker på at du vil slette ' + this.form.name + '?\n\nAfdelingen vil stadig fungere med evt lokaler, som er sat til at bruge den.')) return

        await YogoApi.delete('/branches/' + this.$route.params.id)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + ' er slettet',
        })
        this.$router.push({name: 'SettingsBranches'})

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
    created() {
      if (this.stateReady && this.$route.meta.formType === 'edit') this.fetchBranch()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState && this.$route.meta.formType === 'edit') this.fetchBranch()
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

<style lang="stylus">

</style>
