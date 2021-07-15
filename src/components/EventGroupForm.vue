<template>
  <div>
    <div class="flex__2-1--container">
      <h2>{{ pageTitle }}</h2>
    </div>
    <div class="space4"></div>
    <md-button class="md-raised">
      <router-link :to="{ name: 'EventGroups' }">{{ $t('global.Back') }}</router-link>
    </md-button>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('name')">
          <label>{{ $t('global.EventGroupName') }}</label>
          <md-input v-model="form.name" required></md-input>
          <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.NameMust') }}</span>
        </md-field>

        <colorpickerfield
          :color.sync="form.color"
          class="flex--50"
          :label="$t('global.Color')"
        >
        </colorpickerfield>

      </div>

      <div class="space8"></div>

      <imagefield :imageId.sync="form.image" imageFormat="square"></imagefield>

      <md-field class="flex--50">
        <label>{{ $t('global.Description') }}</label>
        <md-textarea v-model="form.description"></md-textarea>
      </md-field>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ save }}</md-button>
      <md-button class="md-raised md-primary red" v-if="formType === 'edit'" @click="deleteEventGroup">{{ $t('global.Delete') }}
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
  import ColorPickerfield from './ColorPickerField'
  import Colorpickerfield from "./ColorPickerField.vue"

  const {required} = require('vuelidate/lib/validators')

  export default {

    components: {
      LoadingAnimation,
      Imagefield,
      Colorpickerfield,
    },
    name: 'eventgroupform',
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
      ]),
    },
    props: ['formType'],
    data() {
      return {
        pageTitle: this.formType === 'edit' ? this.$t('global.EditEventGroup') : this.$t('global.CreateEventGroup'),
        eventgroupName: 'Kursusgruppenavn',
        descriptionLabel: 'Beskrivelse',
        deleteLabel: 'Slet kursusgruppe',
        save: this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateEventGroup'),

        form: {
          color: '#194d33',
        },

        loading: this.formType === 'edit',
      }
    },
    created() {
      if (this.formType === 'edit') this.fetchEventGroup()
    },
    methods: {

      async fetchEventGroup() {
        this.form = await YogoApi.get('/event-groups/' + this.$route.params.id)
        this.loading = false
      },

      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const saveFields = ['name', 'description', 'image', 'color']

        const eventGroupData = _.pick(this.form, saveFields)

        if (this.formType === 'edit') {

          await YogoApi.put('/event-groups/' + this.$route.params.id, eventGroupData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: eventGroupData.name + this.$t('global.hasBeenUpdated'),
          })

        }


        if (this.formType === 'add') {

          await YogoApi.post('/event-groups', eventGroupData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: eventGroupData.name + this.$t('global.isCreated'),
          })

        }

        this.$router.push({name: 'EventGroups'})

      },
      async deleteEventGroup() {
        if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + this.$t('global.EventThatAreUsedWillNotBeDeleted'))) return

        await YogoApi.delete('/event-groups/' + this.$route.params.id)
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isDeleted'),
        })
        this.$router.push({name: 'EventGroups'})
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
