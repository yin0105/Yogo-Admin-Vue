<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectClassTypesOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoClassTypesCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectClassTypes',
  components: { Treeselect },
  data() {
    return {
      classTypes: [],
    };
  },
  // props: ['value'],
  computed: {
    treeSelectClassTypesOptions() {
      return this.classTypes.length
          ? [
            {
              id: 'all_classTypes',
              label: this.$t('global.AllClassTypes'),
              children: _.sortBy(
                  _.map(this.classTypes, classType => {
                    return {
                      id: classType.id,
                      label: classType.name,
                    };
                  }),
                  'label',
              ),
            },
          ]
          : [];
    },
    value() {
      let val = []
      if (this.classTypes.length) {
        for (const i in this.classTypes) {
          val.push(this.classTypes[i].id);
        }
      }
      return val;
    },
  },
  async created() {
    this.classTypes = await YogoApi.get('/class-types');
    this.classTypes = _.sortBy(this.classTypes, 'name');
    console.log("this.classTypes = ", this.classTypes);
  },
  methods: {
    updateValue(newValue) {
      let selectedClassTypes = [];
      for (const i in this.classTypes) {
        for (const j in newValue) {
          if (this.classTypes[i].id == newValue[j]) {
            selectedClassTypes.push({"id": this.classTypes[i].id, "name": this.classTypes[i].name});
            break;
          }
        }
      }
      this.$emit('update:classTypes', selectedClassTypes);
    },
  },
};

</script>
