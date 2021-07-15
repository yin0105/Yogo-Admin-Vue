<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'Prices' }">{{ $t('global.Back') }}</router-link>
      </md-button>

      <div class="space4"></div>

      <div class="flex--50">

        <div class="space8"></div>

        <imagefield :imageId.sync="form.image" :imageFormat="'square'"
                    class="flex--50 file--square flex__align--start"></imagefield>

        <md-field :class="getValidationClass('name')">
          <label>{{ $t('global.Name') }}</label>
          <md-input v-model="form.name" type="text" required></md-input>
          <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.NameMust') }}</span>
        </md-field>

        <md-field>
          <label>{{ $t('global.Description') }}</label>
          <md-textarea v-model="form.description"></md-textarea>
        </md-field>

        <md-field :class="getValidationClass('price')">
          <label>{{ $t('global.Price') }}</label>
          <md-input v-model="form.price" type="number" required></md-input>
          <span class="md-error" v-if="!$v.form.price.required">{{ $t('global.PriceMust') }}</span>
        </md-field>

        <div>
          <md-checkbox v-model="form.limited_number_per_customer">
            {{ $t('global.LimitedNumberOfClassPassesPerCustomer') }}
          </md-checkbox>
        </div>

        <md-field :class="getValidationClass('max_number_per_customer')"
                  v-if="form.limited_number_per_customer">
          <label>{{ $t('global.MaxNumberPerCustomer') }}</label>
          <md-input v-model="form.max_number_per_customer" type="number" min="1"
                    required></md-input>
          <span class="md-error" v-if="!$v.form.max_number_per_customer.required">{{
              $t('global.MaxNumberMust')
            }}</span>
          <span class="md-error"
                v-if="!$v.form.max_number_per_customer.minValue">{{ $t('global.AtLeastOne') }}</span>
        </md-field>

        <md-field :class="getValidationClass('number_of_classes')"
                  v-if="classPassTypeTypeIsFixedCount">
          <label>{{ $t('global.NumberOfClasses') }}</label>
          <md-input v-model="form.number_of_classes" type="number" required></md-input>
          <span class="md-error" v-if="!$v.form.number_of_classes.required">{{
              $t('global.NumberOfClassesMust')
            }}</span>
        </md-field>

        <md-field :class="getValidationClass('days')">
          <label>{{ $t('global.ValidForNumberOfDays') }}</label>
          <md-input v-model="form.days" type="number" required></md-input>
          <span class="md-error" v-if="!$v.form.days.required">{{ $t('global.MustBe') }}</span>
        </md-field>
      </div>

      <div class="flex--row">
        <div class="flex--50">

          <h3>
            {{
              client.settings.livestream_enabled ? $t('global.AppliesToClassTypesStudio') : $t('global.AppliesToClassTypes')
            }}
          </h3>
          <!--<Treeselect
              v-model="form.class_types"
              :multiple="true"
              :options="treeSelectClassTypesOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoClassTypesCreatedYet')"
          />-->
          <YogoTreeselectClassTypes v-model="form.class_types"></YogoTreeselectClassTypes>

        </div>

        <div class="flex--50" v-if="client.settings.livestream_enabled">

          <h3>
            {{ $t('global.AppliesToClassTypesLivestream') }}
          </h3>
          <!--<Treeselect
              v-model="form.class_types_livestream"
              :multiple="true"
              :options="treeSelectClassTypesOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoClassTypesCreatedYet')"
          />-->
          <YogoTreeselectClassTypes v-model="form.class_types_livestream"></YogoTreeselectClassTypes>

        </div>

      </div>

      <div class="flex--row">

        <div class="flex--50" v-if="client.extended_video_enabled">
          <md-checkbox v-model="form.access_all_videos">{{ $t('global.GivesAccessToAllVideos') }}</md-checkbox>
        </div>

        <div class="flex--50">
          <h3>
            {{ $t('global.AppliesToVideoGroups') }}
          </h3>
          <!--<Treeselect
              v-model="form.video_groups"
              :multiple="true"
              :options="treeSelectVideoGroupsOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
              :no-options-text="$t('global.NoVideoGroupsYet')"
          />-->
          <YogoTreeselectVideoGroups v-model="form.video_groups"></YogoTreeselectVideoGroups>
        </div>

      </div>

      <div class="flex--50">

        <h3>
          {{ $t('global.ShowInPriceGroups') }}
        </h3>
        <!--<Treeselect
            v-model="form.price_groups"
            :multiple="true"
            :options="treeSelectPriceGroupsOptions"
            :clearable="false"
            :defaultExpandLevel="1"
            value-consists-of="LEAF_PRIORITY"
            :no-options-text="$t('global.NoPriceGroupsCreatedYet')"
        />-->
        <YogoTreeselectPriceGroups v-model="form.price_groups"></YogoTreeselectPriceGroups>

        <div class="space8"></div>

        <div>
          <md-checkbox v-model="form.has_max_number_of_simultaneous_bookings">
            {{
              client.settings.livestream_enabled ? $t('global.MaxNumberOfSimultaneousStudioBookings') : $t('global.MaxNumberOfSimultaneousBookings')
            }}
          </md-checkbox>
        </div>

        <md-field :class="getValidationClass('max_number_of_simultaneous_bookings')"
                  v-if="form.has_max_number_of_simultaneous_bookings">
          <label>
            {{
              client.settings.livestream_enabled ? $t('global.MaxNumberOfSimultaneousStudioBookings') : $t('global.MaxNumberOfSimultaneousBookings')
            }}
          </label>
          <md-input v-model="form.max_number_of_simultaneous_bookings" type="number" min="1"
                    required></md-input>
          <span class="md-error"
                v-if="!$v.form.max_number_of_simultaneous_bookings.required">{{ $t('global.MustBeAtLeastOne') }}</span>
          <span class="md-error"
                v-if="!$v.form.max_number_of_simultaneous_bookings.minValue">{{ $t('global.MustBeAtLeastOne') }}</span>
        </md-field>

        <div class="space8"></div>

        <md-checkbox v-model="form.send_email_to_customer">{{ $t('global.sendEmailToCustomerClassPass') }}
        </md-checkbox>

        <md-field :class="getValidationClass('email_subject')" v-if="form.send_email_to_customer">
          <label>{{ $t('global.EmailSubject') }}</label>
          <md-input v-model="form.email_subject" type="text" required></md-input>
          <span class="md-error"
                v-if="!$v.form.email_subject.required">{{ $t('global.SubjectMust') }}</span>
        </md-field>

        <md-field :class="getValidationClass('email_body')" v-if="form.send_email_to_customer">
          <label>{{ $t('global.EmailText') }}</label>
          <md-textarea v-model="form.email_body" required></md-textarea>
          <span class="md-error"
                v-if="!$v.form.email_body.required">{{ $t('global.EmailTextMust') }}</span>
        </md-field>
        <div v-if="form.send_email_to_customer">
          {{ $t('global.FollowingCodesCanBeUsed') }} [customer_first_name], [customer_last_name],
          [customer_profile_link],
          [studio_name], [class_pass_name], {{
            classPassTypeTypeIsFixedCount ?
                '[class_pass_number_of_classes],' : ''
          }}
          [class_pass_valid_until_date]
        </div>

        <div class="space8"></div>

      </div> <!-- flex--50 -->


      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
      <md-button class="md-raised md-primary red" v-if="formType === 'edit'" @click="destroy">
        {{ $t('global.Delete') }}
      </md-button>
      <div class="space8"></div>
      <div class="space8"></div>

      <div v-if="formType === 'edit' && originalClassPassType">
        <h3>{{
            this.classPassTypeType === 'fixed_count' ? $t('global.ClassPasses_FixedCount') : $t('global.ClassPasses')
          }} ({{
            originalClassPassType.class_passes.length
          }})</h3>

        <md-button
            type="button"
            class="md-raised md-primary"
            v-if="selectedClassPasses.length"
            @click.prevent="showExportClassPassEmailsDialog = true"
        >
          {{ $t('global.ExportNEmails', { N: selectedClassPasses.length }) }}
        </md-button>

        <YogoTable
            :cols="classPassTableCols"
            :rows="originalClassPassType.class_passes"
            :pageSize="50"
            selectable="multiple"
            @selected="onClassPassSelect"
        >
          <template v-slot:default="slotProps">
            <YogoTd>
              <a @click="$router.push({name: 'CustomerInfo', params: {id: slotProps.item.user.id}})">{{
                  slotProps.item.user.first_name + ' ' + slotProps.item.user.last_name
                }}</a>
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.user.email }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.createdAt | moment('D. MMMM YYYY') }}
            </YogoTd>
            <YogoTd>
              {{ slotProps.item.valid_until | moment('D. MMMM YYYY') }}
            </YogoTd>
            <YogoTd v-if="classPassTypeType === 'fixed_count'" style="text-align: right">
              {{ slotProps.item.classes_left }}
            </YogoTd>
            <YogoTd>
              <router-link :to="{name: 'ClassPassEdit', params: {id: slotProps.item.id}}">
                {{ $t('global.Edit') }}
              </router-link>
            </YogoTd>
          </template>
        </YogoTable>


      </div>

      <md-dialog :md-active.sync="showExportClassPassEmailsDialog">
        <md-dialog-title>{{ $t('global.ExportEmails') }}</md-dialog-title>
        <md-dialog-content>
          <md-field>
            <label>{{ $t('global.Emails') }}</label>
            <md-textarea v-model="exportClassPassEmailsResult"></md-textarea>
          </md-field>
          <p>
            {{ $t('global.ExportEmailsDesc') }}
          </p>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button type="button" @click.prevent="showExportClassPassEmailsDialog = false">
            {{ $t('global.Close') }}
          </md-button>
        </md-dialog-actions>
      </md-dialog>


    </div>
  </div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import Imagefield from './ImageField.vue';
import LoadingAnimation from './LoadingAnimation.vue';

import { mapGetters } from 'vuex';
import YogoTable from '@/components/ui/YogoTable';
import YogoTd from '@/components/ui/YogoTd';
import YogoTreeselectClassTypes from '@/components/ui/YogoTreeselectClassTypes';
import YogoTreeselectVideoGroups from '@/components/ui/YogoTreeselectVideoGroups';
import YogoTreeselectPriceGroups from '@/components/ui/YogoTreeselectPriceGroups';

const {
  required,
  numeric,
  minValue,
} = require('vuelidate/lib/validators');

export default {
  components: {
    YogoTreeselectClassTypes,
    YogoTreeselectVideoGroups,
    YogoTreeselectPriceGroups,
    YogoTable: YogoTable,
    YogoTd: YogoTd,
    LoadingAnimation,
    Imagefield,
  },
  data() {
    return {

      originalClassPassType: null,

      form: {
        class_types: [],
        class_types_livestream: [],
        video_groups: [],
        price_groups: [],
        send_email_to_customer: false,
        limited_number_per_customer: false,
        max_number_per_customer: 1,
        has_max_number_of_simultaneous_bookings: false,
        max_number_of_simultaneous_bookings: 2,
      },

      loading: this.formType === 'edit',

      currentClassPassSort: 'sort_full_name',
      currentClassPassSortOrder: 'asc',

      selectedClassPasses: [],
      showExportClassPassEmailsDialog: false,

      classPassTableCols: [
        {
          label: this.$t('global.Customer'),
          sortBy: 'sort_full_name',
        },
        {
          label: this.$t('global.Email'),
          sortBy: 'sort_email',
        },
        {
          label: this.$t('global.Created'),
          sortBy: 'createdAt',
        },
        {
          label: this.$t('global.ValidUntilAndIncluding'),
          sortBy: 'valid_until',
        },
        {
          label: this.$t('global.ClassesLeft'),
          sortBy: 'classes_left',
          numeric: true,
        },
        { label: '' },
      ],
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),

    exportClassPassEmailsResult() {
      const emails = _.map(this.selectedClassPasses, classPass => classPass.user.email);
      return emails.join(';');
    },
    classPassTypeType() {
      return this.$route.meta.classPassTypeType;
    },
    classPassTypeTypeString() {
      return this.$route.meta.classPassTypeType === 'fixed_count' ? this.$t('global.ClassPassFixedNumber') : this.$t('global.ClassPassTimeBased');
    },
    classPassTypeTypeIsFixedCount() {
      return this.$route.meta.classPassTypeType === 'fixed_count';
    },
    formType() {
      return this.$route.meta.formType;
    },
    saveLabel() {
      return this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.Create');
    },
    pageTitle() {
      return this.formType === 'edit' ?
          (this.classPassTypeTypeIsFixedCount ? this.$t('global.EditClassPassFixedNumber') : this.$t('global.EditClassPassTimeBased')) :
          (this.classPassTypeTypeIsFixedCount ? this.$t('global.CreateClassPassFixedNumber') : this.$t('global.CreateClassPassTimeBased'));
    },
  },
  created: async function () {
    this.classPassTableCols.splice(4, this.classPassTypeType === 'unlimited' ? 1 : 0);
    if (this.formType === 'edit') {
      await this.fetchClassPassType();
      this.$nextTick(() => {
        this.loading = false;
      });

    }
  },

  methods: {
    async fetchClassPassType() {
      this.form = await YogoApi.get('/class-pass-types/' + this.$route.params.id +
          '?populate[]=class_types' +
          '&populate[]=class_types_livestream' +
          '&populate[]=video_groups' +
          '&populate[]=price_groups' +
          '&populate[]=class_passes' +
          '&populate[]=class_passes.user' +
          '&populate[]=class_passes.user.image',
      );
      this.originalClassPassType = _.cloneDeep(this.form);

      _.each(this.originalClassPassType.class_passes, classPass => {
        classPass.sort_email = classPass.user.email;
        classPass.sort_full_name = classPass.user.first_name + ' ' + classPass.user.last_name;
      });

      delete this.form.class_passes;

      this.form.class_types = _.map(this.form.class_types, 'id');
      this.form.class_types_livestream = _.map(this.form.class_types_livestream, 'id');
      this.form.video_groups = _.map(this.form.video_groups, 'id');
      this.form.price_groups = _.map(this.form.price_groups, 'id');
    },
    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      let classPassData = _.pick(this.form, [
        'name',
        'description',
        'price',
        'days',
        'class_types',
        'class_types_livestream',
        'video_groups',
        'access_all_videos',
        'price_groups',
        'image',
        'send_email_to_customer',
        'email_subject',
        'email_body',
        'limited_number_per_customer',
        'max_number_per_customer',
        'has_max_number_of_simultaneous_bookings',
        'max_number_of_simultaneous_bookings',
      ]);

      if (this.classPassTypeTypeIsFixedCount) {
        classPassData.number_of_classes = this.form.number_of_classes;
      }

      if (
          classPassData.price <= 0 &&
          !classPassData.limited_number_per_customer &&
          !confirm(this.$t('global.PriceIsNullOK'))
      ) {
        return;
      }

      if (this.formType === 'edit') {
        await YogoApi.put('/class-pass-types/' + this.$route.params.id, classPassData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.hasBeenUpdated'),
        });

      } else {
        classPassData.pass_type = this.classPassTypeType;
        await YogoApi.post('/class-pass-types', classPassData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isCreated'),
        });

      }
      this.$router.push({ name: 'Prices' });

    },

    async destroy() {

      if (!confirm(this.$t('global.DoYouWantToDeleteClassPass'))) return;

      await YogoApi.delete('/class-pass-types/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.name + this.$t('global.isDeleted'),
      });

      this.$router.push({ name: 'Prices' });
    },

    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
    customClassPassSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentClassPassSort;

        if (_.isNumber(a[sortBy]) && _.isNumber(b[sortBy])) {
          if (a[sortBy] > b[sortBy]) return this.currentClassPassSortOrder === 'desc' ? 1 : -1;
          if (a[sortBy] < b[sortBy]) return this.currentClassPassSortOrder === 'desc' ? -1 : 1;
          return 0;
        }

        const aString = a[sortBy].toString();
        const bString = b[sortBy].toString();

        if (this.currentClassPassSortOrder === 'desc') {
          return aString.localeCompare(bString);
        }

        return bString.localeCompare(aString);
      });
    },
    onClassPassSelect(items) {
      this.selectedClassPasses = items;
    },
  },
  validations() {
    let v = {
      form: {
        name: {
          required,
        },
        price: {
          required,
          numeric,
        },
        days: {
          required,
          numeric,
        },
      },
    };

    if (this.classPassTypeTypeIsFixedCount) {
      v.form.number_of_classes = {
        required,
        numeric,
      };
    }

    if (this.form.send_email_to_customer) {
      v.form.email_subject = {
        required,
      };
      v.form.email_body = {
        required,
      };
    }

    if (this.form.limited_number_per_customer) {
      v.form.max_number_per_customer = {
        required,
        minValue: minValue(1),
      };
    }

    if (this.form.has_max_number_of_simultaneous_bookings) {
      v.form.max_number_of_simultaneous_bookings = {
        required,
        minValue: minValue(1),
      };
    }

    return v;
  },
};

</script>
