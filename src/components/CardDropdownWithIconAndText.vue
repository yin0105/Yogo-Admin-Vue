<template>
  <md-card>
    <md-card-expand>
      <md-card-actions class="md-layout">

        <md-card-expand-trigger class="md-layout-item">
          <md-button class="customer-history-item-button">
            <div class="left">
              <slot name="icon-and-title"></slot>
            </div>
            <md-icon>keyboard_arrow_down</md-icon>
          </md-button>
        </md-card-expand-trigger>

      </md-card-actions>
    </md-card-expand>
    <md-card-expand-content>
      <md-card-content>
        <slot></slot>
      </md-card-content>
    </md-card-expand-content>
  </md-card>

</template>

<style lang="scss">

  .customer-history-item-button {

    .md-button-content {
      text-align: left;
      width:100%;
      display:flex;
      justify-content: space-between;

      .md-icon {
        margin-left: auto;
        margin-right:0;
      }

      div.left .md-icon {
        margin-right: 15px;
      }
    }
  }

</style>
