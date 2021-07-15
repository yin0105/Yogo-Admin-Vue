<template>
  <div>

    <h2>{{ $t('global.Overview') }}</h2>

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div class="flex--row" v-else>

      <div class="card__standard--container flex--50">

        <h3>{{ $t('global.TodaysClasses') }}</h3>

        <CardClass v-for="classItem in classes" :classItem="classItem" :key="'c'+classItem.id"></CardClass>

        <p v-if="!classes.length">
          ( {{ $t('global.NoClassesToday') }} )
        </p>

      </div> <!-- card__standard--container -->

      <div class="card__standard--container flex--50">

        <h3>{{ $t('global.TodaysEvents') }}</h3>

        <CardEvent v-for="eventTimeSlot in eventTimeSlots" :eventTimeSlot="eventTimeSlot"
                   :key="'ets'+eventTimeSlot.id"></CardEvent>

        <p v-if="!eventTimeSlots.length">
          ( {{ $t('global.NoEventsToday') }} )
        </p>

      </div> <!-- card__standard--container -->

    </div> <!-- flexbox__grid3--conatiner -->

  </div>
</template>

<script>
import CardClass from './CardClass';
import CardEvent from './CardEvent';
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import moment from 'moment-timezone';

export default {
  name: 'Dashboard',
  components: {
    LoadingAnimation,
    CardClass,
    CardEvent,
  },
  data() {
    return {
      loading: true,
      classes: [],
      eventTimeSlots: [],
    };
  },
  created() {
    this.fetchClasses();
  },
  methods: {
    async fetchClasses() {
      let classesResponse;
      [classesResponse, this.eventTimeSlots] = await Promise.all([
        YogoApi.get('/classes' +
            '?startDate=' + moment.tz('Europe/Copenhagen')
                .format('YYYY-MM-DD') +
            '&endDate=' + moment.tz('Europe/Copenhagen')
                .format('YYYY-MM-DD') +
            '&populate[]=class_type' +
            '&populate[]=signups' +
            '&populate[]=signups.user' +
            '&populate[]=signups.user.image' +
            '&populate[]=livestream_signups.user.image' +
            '&populate[]=teachers' +
            '&populate[]=teachers.image' +
            '&populate[]=room' +
            '&populate[]=room.branch' +
            '&sort[]=' + encodeURIComponent('start_time ASC'),
        ),
        YogoApi.get('/event-time-slots' +
            '?startDate=' + moment.tz('Europe/Copenhagen')
                .format('YYYY-MM-DD') +
            '&endDate=' + moment.tz('Europe/Copenhagen')
                .format('YYYY-MM-DD') +
            '&populate[]=event' +
            '&populate[]=event.signups' +
            '&populate[]=event.signups.user' +
            '&populate[]=event.signups.user.image' +
            '&populate[]=event.teachers' +
            '&populate[]=event.teachers.image' +
            '&sort[]=' + encodeURIComponent('start_time ASC'),
        )],
      );

      this.classes = classesResponse.classes;

      this.loading = false;
    },
  },
};

</script>

