<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>
    <div v-else>
      <div class="flex__2-1--container">
        <h2>{{ videoGroupFormTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'VideoGroups' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex--row">

        <md-field :class="getValidationClass('name')" class="flex--50">
          <label>{{ $t('global.Name') }}</label>
          <md-input required v-model="form.name" type="text"></md-input>
          <span class="md-error"
                v-if="!$v.form.name.required">{{ $t('global.VideoGroupNameMust') }}</span>
        </md-field>
      </div>

      <div class="flex--row">

        <div class="flex--50 mb-4">
          <span class="bold block mb-2">
            {{ $t('global.CanBeSeenWithMemberships') }}
          </span>
          <YogoTreeselectMembershipTypes v-model="form.membership_types"></YogoTreeselectMembershipTypes>
        </div>

        <div class="flex--50 mb-4">
          <span class="bold block mb-2">
            {{ $t('global.CanBeSeenWithClassPasses') }}
          </span>
          <YogoTreeselectClassPassTypes v-model="form.class_pass_types"></YogoTreeselectClassPassTypes>
        </div>

      </div>

      <div class="flex--row">

        <div class="flex--50 mb-4">
          <span class="bold block mb-2">
            {{ $t('global.CanBeSeenWithEvents') }}
          </span>
          <Treeselect
              v-model="form.events"
              :multiple="true"
              :options="treeSelectEventsOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
          />
        </div>

        <div class="flex--50">
          <md-checkbox v-model="form.public_access">{{ $t('global.CanBeSeenByAnyone') }}</md-checkbox>
        </div>
      </div>

      <div class="space4"></div>

      <div class="flex--row">
        <div class="flex--50 flex--row">
          <md-field class="flex--50">
            <label>{{ $t('global.SortBy') }}</label>
            <md-select v-model="form.sort_videos_by">
              <md-option value="name">{{ $t('global.Title') }}</md-option>
              <md-option value="created">{{ $t('global.TimeCreated') }}</md-option>
            </md-select>
          </md-field>

          <md-field class="flex--50">
            <md-select v-model="form.sort_videos_direction" v-if="form.sort_videos_by === 'name'">
              <md-option value="asc">A-Å</md-option>
              <md-option value="desc">Å-A</md-option>
            </md-select>
            <md-select v-model="form.sort_videos_direction"
                       v-else-if="form.sort_videos_by === 'created'">
              <md-option value="asc">{{ $t('global.OldestFirst') }}</md-option>
              <md-option value="desc">{{ $t('global.NewestFirst') }}</md-option>
            </md-select>
          </md-field>
        </div>

        <div class="flex--50 flex--row">
          <md-checkbox v-model="form.show_video_descriptions">
            {{ $t('global.ShowVideoDescriptions') }}
          </md-checkbox>
        </div>
      </div>
    </div>

    <div class="space8"></div>

    <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
    <md-button
        class="md-raised md-primary red"
        v-if="formType === 'edit'"
        @click="deleteVideoGroup"
    >
      {{ $t('global.Delete') }}
    </md-button>

    <div class="space8"></div>

  </div>

</template>

<script>
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import YogoTreeselectClassPassTypes from '@/components/ui/YogoTreeselectClassPassTypes';
import YogoTreeselectMembershipTypes from '@/components/ui/YogoTreeselectMembershipTypes';

const {
  required,
  integer,
  minLength,
  between,
  minValue,
} = require('vuelidate/lib/validators');

export default {
  components: {
    YogoTreeselectMembershipTypes,
    YogoTreeselectClassPassTypes,
    LoadingAnimation,
    Treeselect,
  },
  data() {
    return {
      videoGroupFormTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditVideoGroup') : this.$t('global.CreateVideoGroup'),

      saveLabel: this.$route.meta.formType === 'edit' ? this.$t('global.Update') : this.$t('global.Create'),
      loading: true,

      form: {
        name: '',
        membership_types: [],
        class_pass_types: [],
        events: [],
        public_access: false,
        sort_videos_by: 'created',
        sort_videos_direction: 'desc',
        show_video_descriptions: false,
      },

      events: [],
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
    ]),

    treeSelectEventsOptions() {
      return [
        {
          id: 'all_events',
          label: this.$t('global.AllEvents'),
          children: _.sortBy(
              _.map(this.events, event => ({
                id: event.id,
                label: event.name,
              })),
              'label',
          ),
        },
      ];
    },

    formType() {
      return this.$route.meta.formType;
    },
    sortVideosBy() {
      return this.form.sort_videos_by;
    },
  },
  async created() {
    await this.fetchItems();
    if (this.formType === 'edit' && this.stateReady) {
      this.fetchVideoGroup();
    } else {
      this.loading = false;
    }
  },
  watch: {
    stateReady(newReadyState) {
      if (this.formType === 'edit' && newReadyState) this.fetchVideoGroup();
    },
  },
  methods: {
    async fetchItems() {
      [this.classPassTypes, this.membershipTypes, this.events] = await Promise.all([
        YogoApi.get('/class-pass-types'),
        YogoApi.get('/membership-types'),
        YogoApi.get('/events'),
      ]);
    },

    async fetchVideoGroup() {
      this.form = await YogoApi.get(
          '/video-groups/' + this.$route.params.id +
          '?populate[]=membership_types' +
          '&populate[]=class_pass_types' +
          '&populate[]=events',
      );
      this.form.membership_types = _.map(this.form.membership_types, 'id');
      this.form.class_pass_types = _.map(this.form.class_pass_types, 'id');
      this.form.events = _.map(this.form.events, 'id');

      this.$watch('form.sort_videos_by', newValue => {
        if (newValue === 'name') {
          this.form.sort_videos_direction = 'asc';
        } else {
          this.form.sort_videos_direction = 'desc';
        }
      });

      this.loading = false;
    },


    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const videoGroupData = _.pick(this.form, [
        'name',
        'membership_types',
        'class_pass_types',
        'events',
        'public_access',
        'sort_videos_by',
        'sort_videos_direction',
        'show_video_descriptions',
      ]);

      switch (this.formType) {
        case 'add':
          await YogoApi.post('/video-groups', videoGroupData);
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.isCreated'),
          });
          break;

        case 'edit':
          await YogoApi.put('/video-groups/' + this.$route.params.id, videoGroupData);
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.hasBeenUpdated'),
          });
      }
      this.$router.push({ name: 'VideoGroups' });
    },


    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },


    async deleteVideoGroup() {
      if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + this.$t('global.deleteVideoDesc'))) return;

      await YogoApi.delete('/video-groups/' + this.$route.params.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.form.name + this.$t('global.isDeleted'),
      });
      this.$router.push({ name: 'VideoGroups' });

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

