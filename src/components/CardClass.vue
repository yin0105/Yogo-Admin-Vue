<template>
  <div class="card-expansion">
    <md-card ref="card">
      <div class="card__header--container" :class="{'blue-light' : !classItem.cancelled, red: classItem.cancelled}">
        <div class="card__header--info-left flex--1">
          <span v-if="classItem.teachers.length" class="teacher">
            <img class="circle"
                 :src="profileImageSrc(classItem.teachers[0].image)">
            <span class="card__header--info-left-inner">
              <span class="text--white">{{ $t('global.Teacher') }}</span>
              <span class="text--white name">{{
                  classItem.teachers[0].first_name + ' ' + classItem.teachers[0].last_name
                }}</span>
              <p class="margin--none md-ripple pointer" v-if="classItem.teachers.length > 1">
                +{{ classItem.teachers.length - 1 }}
                <md-tooltip>
                  {{
                    classItem.teachers.slice(1)
                        .map(t => `${t.first_name} ${t.last_name}`)
                        .join('\n')
                  }}
                </md-tooltip>
              </p>
            </span>
          </span>

        </div>
        <div class="card__header--info-right flex--1 tar-md">
          <span class="white-text title"><span v-if="classItem.cancelled">{{
              $t('global.CANCELLED')
            }}! - </span>{{ classItem.class_type.name }}</span>
          <span class="white-text">{{ classItem.start_time + '-' + classItem.end_time }}</span>
        </div>
      </div>

      <md-card-header>
        <div class="card-content flex flex-col">
          <div class="md-title">
            <div v-if="classItem.room">
              {{ $t('global.Room') }}:
              {{ classItem.room.name }}<span v-if="classItem.room.branch">, {{ classItem.room.branch.name }}</span>
            </div>
          </div>
          <div v-if="classItem.studio_attendance_enabled">
            <div class="md-subhead">{{ $t('global.SignedUp') }}: {{
                classItem.signups.length + '/' + classItem.seats
              }}
            </div>

            <div class="space1"></div>

            <md-avatar v-for="signup in visibleSignups" :key="signup.id">
              <img class="user__img--small pointer"
                   @click="$router.push({name:'CustomerInfo', params: { id: signup.user.id }})"
                   :src="profileImageSrc(signup.user.image)"
                   alt=""/>
              <md-tooltip md-direction="top">{{ signup.user.first_name + ' ' + signup.user.last_name }}</md-tooltip>
            </md-avatar>
            <md-button v-if="classItem.signups.length > numberOfAvatarsOnOneLine" @click.prevent="showAllSignups = !showAllSignups">
              <span v-if="!showAllSignups">
                + {{ classItem.signups.length - numberOfAvatarsOnOneLine }}
              </span>
              <span v-if="showAllSignups">
                {{ $t('global.ShowLess') }}
              </span>

            </md-button>
          </div>

          <div v-if="classItem.livestream_enabled">
            <div class="md-subhead">{{ $t('global.SignedUpForLivestream') }}: {{
                classItem.livestream_signups.length
              }}
            </div>

            <div class="space1"></div>

            <md-avatar v-for="livestreamSignup in visibleLivestreamSignups"
                       :key="`livestream_signup_${livestreamSignup.id}`">
              <img class="user__img--small pointer"
                   @click="$router.push({name:'CustomerInfo', params: { id: livestreamSignup.user.id }})"
                   :src="profileImageSrc(livestreamSignup.user.image)"
                   alt=""/>
              <md-tooltip md-direction="top">{{
                  livestreamSignup.user.first_name + ' ' + livestreamSignup.user.last_name
                }}
              </md-tooltip>
            </md-avatar>
            <md-button v-if="classItem.livestream_signups.length > numberOfAvatarsOnOneLine"
                       @click.prevent="showAllLivestreamSignups = !showAllLivestreamSignups">
              <span v-if="!showAllLivestreamSignups">
                + {{ classItem.livestream_signups.length - numberOfAvatarsOnOneLine }}
              </span>
              <span v-if="showAllLivestreamSignups">
                {{ $t('global.ShowLess') }}
              </span>

            </md-button>
          </div>

        </div>

      </md-card-header>

      <div class="clear"></div>


      <div class="padding2">
        <md-button @click="onCardClick">{{ $t('global.GoToClass') }}</md-button>
      </div>
    </md-card>

  </div>
</template>

<script>

import Imgix from '@/services/Imgix';

export default {

  name: 'CardClass',
  props: ['classItem'],
  mixins: [Imgix],
  computed: {
    visibleSignups() {
      return this.showAllSignups
          ? this.classItem.signups
          : this.classItem.signups.slice(0, this.numberOfAvatarsOnOneLine);
    },
    visibleLivestreamSignups() {
      return this.showAllLivestreamSignups
          ? this.classItem.livestream_signups
          : this.classItem.livestream_signups.slice(0, this.numberOfAvatarsOnOneLine);
    },
  },
  data() {
    return {
      showAllSignups: false,
      showAllLivestreamSignups: false,
      numberOfAvatarsOnOneLine: 10,
    };
  },
  mounted() {
    this.calculateNumberOfAvatarsOnOneLine();
    window.addEventListener('resize', this.calculateNumberOfAvatarsOnOneLine);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calculateNumberOfAvatarsOnOneLine);
  },
  methods: {
    calculateNumberOfAvatarsOnOneLine() {
      const cardWidth = this.$refs.card.$el.clientWidth;
      if (!cardWidth) return;
      this.numberOfAvatarsOnOneLine = Math.max(Math.floor(cardWidth / 50) - 2, 3);
    },
    onCardClick() {
      this.$router.push({
        name: 'ClassEdit',
        params: { id: this.classItem.id },
      });
    },
  },
};
</script>
