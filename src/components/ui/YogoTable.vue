<template>
  <md-card>
    <div class="pagination-top-container" v-if="rows.length > pageSize">
      <pagination
          v-model="page"
          :per-page="pageSize"
          :records="rows.length"
          :options="{
              chunksNavigation: 'scroll',
              edgeNavigation: true,
              chunk: 5,
              texts: {
                count: $t('global.PaginationCountText'),
                first: $t('global.PaginationFirst'),
                last: $t('global.PaginationLast' )
              }
            }"
      />
    </div>
    <div class="yogo-table-content">


      <table>
        <tr class="header-row">
          <YogoTh v-if="selectable === 'multiple'" class="md-table-cell-selection">
            <div class="md-table-cell-container">
              <md-checkbox v-model="allRowsSelected"></md-checkbox>
            </div>
          </YogoTh>
          <YogoTh v-for="col in cols"
                  :class="{
              numeric: col.numeric,
              'md-sortable': !!col.sortBy,
              'md-sorted': sortCol === col.sortBy,
              'md-sorted-desc': sortOrder === 'desc'
            }"
                  @click="sortArrowClick(col)"
          >
            <div>
              {{ col.label }}
              <TableSortArrow/>
            </div>
          </YogoTh>
        </tr>

        <tr v-for="(row, idx) in displayedRows"
            class="md-table-row"
            :key="row.id ? 'id_' + row.id : undefined"
            :class="{'md-has-selection': selectable === 'single'}"
            @click="rowClick(row)"
        >
          <YogoTd v-if="selectable === 'multiple'" class="md-table-cell-selection">
            <md-checkbox v-model="rowSelections[(page - 1) * pageSize + idx]"/>
          </YogoTd>
          <slot v-bind:item="row">

          </slot>
        </tr>


      </table>
    </div>
    <div class="pagination-bottom-container" v-if="rows.length > pageSize">
      <pagination
          v-model="page"
          :per-page="pageSize"
          :records="rows.length"
          :options="{
            chunksNavigation: 'scroll',
            edgeNavigation: true,
            chunk: 5,
            texts: {
              count: $t('global.PaginationCountText'),
              first: $t('global.PaginationFirst'),
              last: $t('global.PaginationLast' )
            }
          }"
      />
    </div>
  </md-card>

</template>

<script>

import Pagination from 'vue-pagination-2';
import TableSortArrow from '@/graphics/TableSortArrow';
import YogoTd from '@/components/ui/YogoTd';
import YogoTh from '@/components/ui/YogoTh';

export default {
  name: 'YogoTable',
  components: {
    YogoTh,
    YogoTd,
    TableSortArrow,
    Pagination,
  },
  props: {
    cols: Array,
    rows: Array,
    pageSize: {
      type: Number,
      default: 100,
    },
    selectable: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      page: 1,
      sortCol: null,
      sortOrder: 'asc',
      rowSelections: [],
      allRowsSelected: false,

      disableWatchers: false,
    };
  },
  computed: {
    displayedRows() {
      let sortedRows;
      if (this.sortCol) {
        sortedRows = _.sortBy(
            this.rows,
            (row) => {
              const colValue = row[this.sortCol];
              return colValue.toLowerCase ? colValue.toLowerCase() : colValue;
            },
        );
        if (this.sortOrder === 'asc') {
          sortedRows = _.reverse(sortedRows);
        }
      } else {
        sortedRows = this.rows;
      }

      return sortedRows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    },
  },
  watch: {
    allRowsSelected(allRowsSelected) {
      if (this.disableWatchers) return;

      this.disableWatchers = true;

      this.rowSelections.length = this.rows.length;
      _.fill(this.rowSelections, allRowsSelected, 0, this.rows.length);

      this.$nextTick(() => {
        this.disableWatchers = false;
        this.emitSelectedRows();
      });
    },

    rowSelections(rowSelections) {
      if (this.disableWatchers) return;

      this.disableWatchers = true;

      this.rowSelections.length = this.rows.length;
      this.allRowsSelected = _.every(rowSelections, b => b === true);

      this.$nextTick(() => {
        this.disableWatchers = false;
        this.emitSelectedRows();
      });
    },
  },
  methods: {
    sortArrowClick(row) {
      if (this.sortCol === row.sortBy) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortCol = row.sortBy;
        this.sortOrder = 'desc';
      }
    },
    emitSelectedRows() {
      const selectedRows = _.filter(
          this.rows,
          (row, idx) => {
            return this.rowSelections[idx];
          },
      );
      this.$emit('selected', selectedRows);
    },
    rowClick(row) {
      if (this.selectable === 'single') {
        this.$emit('selected', row);
      }
    }
  },
};

</script>

<style lang="scss" scoped>

.pagination-top-container {
  padding-bottom: 5px;
  background: rgb(236, 239, 241);
}

.pagination-bottom-container {
  padding-top: 5px;
  background: rgb(236, 239, 241);
}

.yogo-table-content {
  overflow-x:scroll;
}

table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  overflow: hidden;

  th {
    text-align: left;
    padding: 0;
    position: relative;
    font-size: 12px;
    line-height: 16px;
    color: rgba(0, 0, 0, 0.54);

    &.numeric {
      text-align: right;
    }

    .table-sort-arrow {
      opacity: 0;
      width: 16px;
      height: 16px;
      transition: .3s cubic-bezier(.4, 0, .2, 1);
    }

    &.sortable {
      cursor: pointer;
    }

    &.sortable:hover .table-sort-arrow,
    &.sorted .table-sort-arrow {
      opacity: 1;
    }

    &.sorted-desc .table-sort-arrow {
      transform: rotate(180deg);
    }
  }


  td {
    height: 48px;
    position: relative;
    transition: .3s cubic-bezier(.4, 0, .2, 1);
    font-size: 13px;
    line-height: 18px;
  }

  tr.md-has-selection:hover {

    td {
      background: rgba(0, 0, 0, 0.08);
    }

  }

}

</style>
