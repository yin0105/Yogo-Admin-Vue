<template>
  <div class="card-expansion">
    <md-card>
      <md-card-header>

        <div class="card-content">
          <h4>{{ activityTitle }}</h4>
          <p>{{ activityText }}</p>
        </div>

        <md-tabs md-sync-route md-dynamic-height md-alignment="left">

          <md-tab id="top5active" :md-label="active">

            <div class="user--row user--list">
              <h3>1</h3>
              <img class="user__img--small" src="../assets/img/anders.jpg" alt="" />
              <p class="name user--active">Ander Hjort Straarup</p>
            </div>

            <div class="user--row user--list">
              <h3>2</h3>
              <img class="user__img--small" src="../assets/img/magnus.jpg" alt="" />
              <p class="name user--active">Magnus H. Friis</p>
            </div>

            <div class="user--row user--list">
              <h3>3</h3>
              <img class="user__img--small" src="../assets/img/magnus.jpg" alt="" />
              <p class="name user--active">Magnus H. Friis</p>
            </div>

            <div class="user--row user--list">
              <h3>4</h3>
              <img class="user__img--small" src="../assets/img/anders.jpg" alt="" />
              <p class="name user--active">Ander Hjort Straarup</p>
            </div>

            <div class="user--row user--list">
              <h3>5</h3>
              <img class="user__img--small" src="../assets/img/magnus.jpg" alt="" />
              <p class="name user--active">Magnus H. Friis</p>
            </div>


          </md-tab> <!-- top5active -->

          <md-tab id="top5passive" :md-label="passive">

            <div class="user--row user--list">
              <h3>1</h3>
              <img class="user__img--small" src="../assets/img/magnus.jpg" alt="" />
              <p class="name user--passive">Magnus H. Friis</p>
            </div>

            <div class="user--row user--list">
              <h3>2</h3>
              <img class="user__img--small" src="../assets/img/anders.jpg" alt="" />
              <p class="name user--passive">Anders Hjort Straarup</p>
            </div>

            <div class="user--row user--list">
              <h3>3</h3>
              <img class="user__img--small" src="../assets/img/magnus.jpg" alt="" />
              <p class="name user--passive">Magnus H. Friis</p>
            </div>

            <div class="user--row user--list">
              <h3>4</h3>
              <img class="user__img--small" src="../assets/img/anders.jpg" alt="" />
              <p class="name user--passive">Ander Hjort Straarup</p>
            </div>

            <div class="user--row user--list">
              <h3>5</h3>
              <img class="user__img--small" src="../assets/img/magnus.jpg" alt="" />
              <p class="name user--passive">Magnus H. Friis</p>
            </div>


          </md-tab>

        </md-tabs> <!-- top5passive -->
      </md-card-header>
    </md-card>
  </div> <!-- card-expansion -->
</template>

<script>

  export default {

    name: 'cardactivity',
    data () {
      return {
        activityTitle: 'Top 5 aktive/passive brugere',
        activityText: 'Klik på en bruger for at sende en påmindelses-mail',
        active: 'Aktive',
        passive: 'Passive'

     }
   },
 }
</script>
