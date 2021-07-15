<template>
  <div class="card-expansion">
    <md-card>
      <md-card-header>
        <div class="card-content">
          <h4>{{ pieTitle }}</h4>
          <div class="user__pie--container">
            <div class="flex--left text-turkis">92%</div>
            <chartdoughnut
            :options="{responsive: true, maintainAspectRatio: false}"
            :width="180"
            :height="150"
            ></chartdoughnut>
            <div class="flex--right text-blue">8%</div>
          </div>
          <div class="space3"></div>
          <div class="user__pie--container">
            <div class="user__pie--info">
              <div class="user__active--bullet">{{ active }}</div>
              <div class="user__passive--bullet">{{ passive }}</div>
            </div>
          </div>
          <div class="space3"></div>
        </div>
        <div class="card-action">
          <div class="space4"></div>
          <md-button>{{ emailActiveText }}</md-button><br />
          <md-button>{{ emailPassiveText }}</md-button>
        </div>

      </md-card-header>
    </md-card>
  </div>
</template>

<script>
  import ChartDoughnut from './ChartDoughnut'

  export default {

    name: 'cardactivitypie',
    components: {
      chartdoughnut: ChartDoughnut
    },
    data () {
      return {
        pieTitle: 'Aktive vs. passive brugere',
        active: 'Aktive',
        passive: 'Passive',
        emailActiveText: 'Kontakt aktive brugere',
        emailPassiveText: 'Kontakt passive brugere',

      }
    },
  }
</script>
