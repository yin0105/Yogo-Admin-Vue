<template>
  <div>
    <h2>{{ $t('global.Teachers') }}</h2>

    <router-link :to="{ name: allowAddTeacher ? 'TeacherAdd' : 'Teachers' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left" v-if="allowAddTeacher">{{ $t('global.CreateNewTeacher') }}</md-tooltip>
        <md-tooltip md-direction="left" v-else>{{
            $t('global.YourPlanOnlyAllowsXTeachers', { numberOfTeachers: 3 })
          }}
        </md-tooltip>
      </md-button>
    </router-link>

    <div class="space8"></div>

    <loading-animation v-if="loading"></loading-animation>
    <md-table v-else v-model="teachers" md-sort="first_name" md-sort-order="asc" md-card @md-selected="onSelectTeacher">
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.ProfileImage')">
          <img class="circle profile-image"
               :src="item.image ? Imgix(item.image.filename, {w:80, h:80, fit:'crop'}) : avatarSvg">
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Name')" md-sort-by="first_name">
          {{ item.first_name + ' ' + item.last_name }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Email')" md-sort-by="email">
          <a :href="'mailto:' + item.email">{{ item.email }}</a>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Phone')">
          <a :href="'tel:' + item.phone">
            {{ item.phone }}
          </a>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <p v-else>

      <md-empty-state
          md-icon="supervisor_account"
          :md-label="$t('global.CreateNewTeacher')"
          :md-description="$t('global.NoTeacherCreatedYet')">
        <router-link :to="{name:'TeacherAdd'}">
          <md-button class="md-primary md-raised">
            {{ $t('global.CreateNewTeacher') }}
          </md-button>
        </router-link>
      </md-empty-state>

    <div class="space8"></div>
  </div>
</template>

<script>


import LoadingAnimation from './LoadingAnimation.vue';
import { mapGetters } from 'vuex';
import YogoApi from '@/gateways/YogoApi';
import Imgix from '@/services/Imgix';

export default {
  name: 'teachers',
  components: {
    LoadingAnimation,

  },
  mixins: [Imgix],
  computed: {
    ...mapGetters([
      'stateReady',
      'client',
    ]),
    avatarSvg: function () {
      return require('../assets/img/account.svg');
    },
    allowAddTeacher() {
      return !this.loading &&
          (this.client.plan !== 'light' || this.teachers.length < 3);
    },
  },
  data() {
    return {
      teachersTitle: 'Undervisere',
      teachers: [],

      teacherProfile: 'Profil',
      teacherName: 'Navn',
      teacherEmail: 'E-mail',
      teacherPhone: 'Telefonnr.',

      loading: true,
    };
  },
  created() {
    if (this.stateReady) this.fetchTeachers();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchTeachers();
    },
  },
  methods: {
    async fetchTeachers() {
      this.teachers = await YogoApi.get(
          '/users' +
          '?teacher=1' +
          '&populate[]=image',
      );
      console.log("teachers = ", this.teachers);

      this.loading = false;

    },
    onSelectTeacher(teacher) {
      this.$router.push({
        name: 'TeacherEdit',
        params: { id: teacher.id },
      });
    },
  },
};
</script>
