<template>
  <div>

    <h4 v-if="title">{{ title }}</h4>

    <div class="md-table md-card md-theme-default" v-if="internalRows.length">
      <div class="md-content md-table-content md-scrollbar md-theme-default">
        <table>
          <thead>
          <tr>
            <th class="md-table-head" v-for="header in headers">
              <div class="md-table-head-container">
                <div class="md-table-head-label align--right">
                  {{ header }}
                </div>
              </div>
            </th>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label align--right">
                  {{ $t('global.Edit') }}
                </div>
              </div>
            </th>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label align--right">
                  {{ $t('global.Delete') }}
                </div>
              </div>
            </th>
            <th class="md-table-head">
              <div class="md-table-head-container">
                <div class="md-table-head-label align--right">
                  {{ $t('global.Order') }}
                </div>
              </div>
            </th>
          </tr>
          </thead>

          <draggable element="tbody" :options="draggableOptions" v-model="internalRows" @change="onSortOrderChange">
            <tr v-for="(row, idx) in internalRows" :key="row.id" md-selectable="single" class="md-table-row">
              <slot v-bind:row="row" class="width--100">

              </slot>
              <td style="width:20px;" class="md-table-cell">
                <div class="md-table-cell-container align--right cursor-grab">
                  <md-button @click="editRow(idx)">
                    <md-icon>create</md-icon>
                  </md-button>
                </div>
              </td>
              <td style="width:20px;" class="md-table-cell">
                <div class="md-table-cell-container align--right cursor-grab">
                  <md-button @click="deleteRow(idx)">
                    <md-icon>close</md-icon>
                  </md-button>
                </div>
              </td>
              <td style="width:20px;" class="md-table-cell">
                <div class="md-table-cell-container align--right cursor-grab">
                  <md-icon>reorder</md-icon>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>

    <md-field>
      <label>{{ addItemLabel }}</label>
      <md-input v-model="addItemFieldValue" @keydown="keydown"></md-input>
      <div class="md-helper-text">{{ addItemHelperText }}</div>
    </md-field>

    <md-dialog :md-active.sync="showEditDialog">
      <md-dialog-title>{{ $t('global.Edit') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <md-input type="text" v-model="editDialogInputValue" ref="editDialogInput"></md-input>
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="showEditDialog = false" class="md-raised">{{ $t('global.Dismiss') }}</md-button>
        <md-button @click="updateRow(editDialogRowIdx, editDialogInputValue)" class="md-primary md-raised">
          {{ $t('global.Save') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>

import draggable from 'vuedraggable';

export default {
  name: 'SortableListWithAddItemField',
  components: {
    draggable,
  },
  data: () => ({
    draggable,
    draggableOptions: {
      animation: 150,
    },
    addItemFieldValue: '',
    internalRows: [],

    showEditDialog: false,
    editDialogRowIdx: null,
    editDialogInputValue: '',
  }),
  props: [
    'title',
    'headers',
    'rows',
    'addItemLabel',
    'addItemHelperText',
  ],
  created() {
    this.internalRows = this.rows;
  },
  watch: {
    rows(newRows) {
      this.internalRows = newRows;
    },
  },
  methods: {
    keydown(e) {
      if (e.key === 'Enter') {
        this.$emit('add', this.addItemFieldValue);
        this.addItemFieldValue = '';
      }
    },
    onSortOrderChange() {
      this.$emit('changeSortOrder', this.internalRows);
    },
    editRow(idx) {
      this.editDialogRowIdx = idx;
      this.editDialogInputValue = this.rows[idx].name;
      this.showEditDialog = true;
      setTimeout(() => {
        this.$refs.editDialogInput.$el.focus();
      }, 50);
    },
    updateRow(idx, value) {
      this.$emit('updateRow', idx, value);
      this.showEditDialog = false;
    },
    deleteRow(idx) {
      this.$emit('delete', idx);
    },
  },
};
</script>
