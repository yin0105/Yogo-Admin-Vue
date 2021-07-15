<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>
    <div v-else>
      <div class="flex__2-1--container">
        <h2>{{ title }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'ClassTypes' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <md-field :class="getValidationClass('name')">
        <label>{{ $t('global.ClassType') }}</label>
        <md-input v-model="form.name" type="text" required></md-input>
        <span class="md-error" v-if="!$v.form.name.required">
          {{ $t('global.ClassTypeNameMust') }}
        </span>
      </md-field>

      <div class="space8"></div>

      <div class="flex--row">
        <imagefield :imageFormat="'landscape'" :imageId.sync="form.image" class="flex--50"></imagefield>
        <colorpickerfield
          :color.sync="form.color"
          class="flex--50"
          :label="$t('global.Color')"
        >
        </colorpickerfield>
      </div>

      <md-field>
        <label>{{ $t('global.Description') }}</label>
        <md-textarea v-model="form.description"></md-textarea>
      </md-field>

      <h3 v-if="client.settings.livestream_enabled">
        {{ $t('global.AccessToThisClassTypeAttendanceClasses') }}
      </h3>
      <h3 v-else>
        {{ $t('global.AccessToThisClassType') }}
      </h3>
      <div class="flex--row">

        <div class="flex--50 mb-4">
          <span class="bold block mb-2">
            {{ $t('global.ClassPassAndTimeBasedCards') }}
          </span>
          <YogoTreeselectClassPassTypes v-model="form.class_pass_types"></YogoTreeselectClassPassTypes>
        </div>

        <div class="flex--50 mb-4">
          <span class="bold block mb-2">
            {{ $t('global.Memberships') }}
          </span>
          <YogoTreeselectMembershipTypes v-model="form.membership_types"></YogoTreeselectMembershipTypes>
        </div>

      </div>

      <div class="space4"></div>

      <div v-if="client.settings.livestream_enabled">
        <h3>
          {{ $t('global.AccessToThisClassTypeLivestream') }}
        </h3>

        <div class="flex--row">

          <div class="flex--50 mb-4">
            <span class="bold block mb-2">
              {{ $t('global.ClassPassAndTimeBasedCards') }}
            </span>
            <YogoTreeselectClassPassTypes v-model="form.class_pass_types_livestream"></YogoTreeselectClassPassTypes>
          </div>

          <div class="flex--50 mb-4">
            <span class="bold block mb-2">
              {{ $t('global.Memberships') }}
            </span>
            <YogoTreeselectMembershipTypes v-model="form.membership_types_livestream"></YogoTreeselectMembershipTypes>
          </div>

        </div>

        <div class="space4"></div>
      </div>

      <h3>
        {{ $t('global.Emails') }}
        <TooltipInfo
            :tooltipText="$t('global.EmailsOnSignupCancellationRemindersAreManagedInSettingsEmails')"
            display-style="inline"
        >
        </TooltipInfo>
      </h3>

      <div class="flex--50 mb-4" v-if="classTypeEmails.length">
          <span class="bold block mb-2">
            {{ $t('global.Emails') }}
          </span>
        <Treeselect
            v-model="form.class_type_emails"
            :multiple="true"
            :options="treeSelectEmailsOptions"
            :clearable="false"
            :defaultExpandLevel="1"
            value-consists-of="LEAF_PRIORITY"
        />
      </div>
      <div v-else>
        {{ $t('global.NoEmailsCreated') }}
      </div>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveButtonText }}</md-button>
      <md-button class="md-raised md-primary red" v-if="formType === 'edit'" @click="deleteClassType">
        {{ $t('global.Delete') }}
      </md-button>

      <div class="space8"></div>

    </div>
  </div>

</template>

<script>
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import Imagefield from './ImageField';
import Colorpickerfield from './ColorPickerField.vue';
import Treeselect from '@riophae/vue-treeselect';
import TooltipInfo from '@/components/TooltipInfo';
import classTypeEmailUtil from '../mixins/classTypeEmailUtil.vue';
import qs from 'qs';
import YogoTreeselectClassPassTypes from '@/components/ui/YogoTreeselectClassPassTypes';
import YogoTreeselectMembershipTypes from '@/components/ui/YogoTreeselectMembershipTypes';

const { required } = require('vuelidate/lib/validators');

export default {
  name: 'ClassTypeForm',
  components: {
    YogoTreeselectMembershipTypes,
    YogoTreeselectClassPassTypes,
    LoadingAnimation,
    Colorpickerfield,
    Imagefield,
    Treeselect,
    TooltipInfo,
  },
  mixins: [classTypeEmailUtil],
  data() {
    return {
      loading: true,

      form: {
        color: '#194d33',
        membership_types: [],
        class_pass_types: [],
      },

      classTypeEmails: [],
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
      'client',
    ]),

    treeSelectEmailsOptions() {
      return [
        {
          id: 'all_emails',
          label: this.$t('global.AllEmails'),
          children: _.sortBy(
              _.map(this.classTypeEmails, classTypeEmail => {
                return {
                  id: classTypeEmail.id,
                  label: this.classTypeEmailTypeText(classTypeEmail) +
                      ': ' + classTypeEmail.subject,
                };
              }),
              'label',
          ),
        },
      ];
    },


    formType() {
      return this.$route.name === 'ClassTypeCreate' ? 'add' : 'edit';
    },
    title() {
      return this.formType === 'edit' ? this.$t('global.EditClassType') : this.$t('global.CreateClassType');
    },
    saveButtonText() {
      return this.formType === 'edit' ? this.$t('global.Update') : this.$t('global.Create');
    },
  },
  async created() {
    await this.fetchClassPassTypesAndMembershipTypes();
    if (this.formType === 'edit' && this.stateReady) {
      this.fetchClassType();
    } else {
      this.loading = false;
    }
  },
  watch: {
    stateReady(newReadyState) {
      if (this.formType === 'edit' && newReadyState) this.fetchClassType();
    },
  },
  methods: {
    async fetchClassPassTypesAndMembershipTypes() {
      this.classTypeEmails = await YogoApi.get('/class-type-emails');
    },

    async fetchClassType() {

      const query = qs.stringify({
        populate: [
          'class_pass_types',
          'membership_types',
          'class_pass_types_livestream',
          'membership_types_livestream',
          'class_type_emails',
          'image'
        ],
      });

      this.form = await YogoApi.get(`/class-types/${this.$route.params.id}?${query}`);
      this.form.class_pass_types = _.map(this.form.class_pass_types, 'id');
      this.form.membership_types = _.map(this.form.membership_types, 'id');
      this.form.class_pass_types_livestream = _.map(this.form.class_pass_types_livestream, 'id');
      this.form.membership_types_livestream = _.map(this.form.membership_types_livestream, 'id');
      this.form.class_type_emails = _.map(this.form.class_type_emails, 'id');
      this.form.image = this.form.image ? this.form.image.id : null;
      this.loading = false;

    },


    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const classTypeData = _.pick(this.form, [
        'name',
        'image',
        'color',
        'description',
        'class_pass_types',
        'membership_types',
        'class_pass_types_livestream',
        'membership_types_livestream',
        'class_type_emails',
      ]);

      if (this.formType === 'add') {
        await YogoApi.post('/class-types', classTypeData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isCreated'),
        });
        this.$router.push({ name: 'ClassTypes' });
        return;
      }
      if (this.formType === 'edit') {
        await YogoApi.put('/class-types/' + this.$route.params.id, classTypeData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.hasBeenUpdated'),
        });
        this.$router.push({ name: 'ClassTypes' });
      }

    },


    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },


    async deleteClassType() {
      if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + this.$t('global.IfClassTypeIsUsedDesc'))) return;

      await YogoApi.delete('/class-types/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.name + this.$t('global.isDeleted'),
      });
      this.$router.push({ name: 'ClassTypes' });

    },
  },
  validations: {
    form: {
      name: {
        required,
      },
    },
  },
};
</script>

