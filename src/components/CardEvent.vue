<template>

  <div class="card-expansion">
    <md-card>
      <div class="card__header--container turkis">
        <div class="card__header--info-left flex--1" v-if="eventTimeSlot.event.teachers.length">
          <img class="circle"
               :src="profileImageSrc(eventTimeSlot.event.teachers[0].image, {}, true)">
          <div class="card__header--info-left-inner">
            <span class="white-text">{{ $t('global.Teacher') }}</span>
            <span class="white-text name">{{
                eventTimeSlot.event.teachers[0].first_name + ' ' + eventTimeSlot.event.teachers[0].last_name
              }}</span>
            <p class="margin--none md-ripple pointer" v-if="eventTimeSlot.event.teachers.length > 1">
              +{{ eventTimeSlot.event.teachers.length - 1 }}
            </p>
          </div>
        </div>
        <div class="card__header--info-right flex--1 tar-md">
          <span class="white-text title">{{ eventTimeSlot.event.name }}</span>
          <span class="white-text">{{ eventTimeSlot.start_time + '-' + eventTimeSlot.end_time }}</span>
        </div>
      </div>

      <md-card-header>
        <div class="card-content">
          <div class="md-title" v-if="eventTimeSlot.event.room">{{ $t('global.Room') }} {{
              eventTimeSlot.event.room.name
            }}
          </div>
          <div class="md-subhead">{{ $t('global.SignedUp') }}: {{
              eventTimeSlot.event.signups.length + '/' +
              eventTimeSlot.event.seats
            }}
          </div>
          <div class="space1"></div>
          <div class="space1"></div>

          <md-avatar v-for="(signup, idx) in eventTimeSlot.event.signups" v-if="idx < 8"
                     :key="'event-signup-header'+signup.id">
            <img class="user__img--small pointer"
                 @click="$router.push({name:'CustomerInfo', params: { id: signup.user.id }})"
                 :src="profileImageSrc(signup.user.image)"
                 alt=""/>
            <md-tooltip md-direction="top">{{ signup.user.first_name + ' ' + signup.user.last_name }}</md-tooltip>
          </md-avatar>

        </div>
      </md-card-header>

      <div class="clear"></div>

      <md-card-expand>
        <md-card-actions md-alignment="space-between">
          <md-card-expand-trigger>
            <md-button v-if="eventTimeSlot.event.signups.length > 8 || eventTimeSlot.event.teachers.length > 1">
              <span
                  v-if="eventTimeSlot.event.signups.length > 8"> + {{
                  eventTimeSlot.event.signups.length - 8
                }}...</span>
              <md-icon>keyboard_arrow_down</md-icon>
            </md-button>
          </md-card-expand-trigger>

          <div>
            <md-button @click.prevent="$router.push({name: 'EventEdit', params: {id: eventTimeSlot.event.id}})">
              {{ $t('global.GoToEvent') }}
            </md-button>
          </div>
        </md-card-actions>

        <md-card-expand-content>
          <md-card-content>

            <span class="teacher--multiple">
              <span v-for="teacher in eventTimeSlot.event.teachers" :key="teacher.id" class="teacher">
                <img class="circle"
                     :src="profileImageSrc(teacher.image)">
                <span class="card__header--info-left-inner">
                  <span>{{ teacherLabel }}</span>
                  <span class=" name">{{ teacher.first_name + ' ' + teacher.last_name }}</span>
                </span>
              </span>
            </span>

            <md-avatar v-for="signup in eventTimeSlot.event.signups" :key="'event-signup-content'+signup.id">
              <img class="user__img--small pointer"
                   @click="$router.push({name:'CustomerInfo', params: { id: signup.user.id }})"
                   :src="profileImageSrc(signup.user.image)"
                   alt=""/>
              <md-tooltip md-direction="top">{{ signup.user.first_name + ' ' + signup.user.last_name }}</md-tooltip>
            </md-avatar>

          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>
  </div> <!-- card -->

</template>

<script>

import Imgix from '@/services/Imgix';

export default {
  name: 'CardEvent',
  mixins: [Imgix],
  props: ['eventTimeSlot'],
};

</script>
