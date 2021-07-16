<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectTeachersOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoTeacherCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectTeacher',
  components: { Treeselect },
  data() {
    return {
      teachers: [],
    };
  },
  props: ['value'],
  computed: {
    treeSelectTeachersOptions() {
      return this.teachers.length
          ? [
            {
              id: 'all_classTypes',
              label: this.$t('global.AllTeachers'),
              children: _.sortBy(
                  _.map(this.teachers, teacher => {
                    return {
                      id: teacher.id,
                      label: teacher.first_name + " " + teacher.last_name,
                    };
                  }),
                  'label',
              ),
            },
          ]
          : [];
    },
  },
  async created() {
    this.teachers = await YogoApi.get(
          '/users' +
          '?teacher=1' +
          '&populate[]=image',
      );
    this.teachers = _.sortBy(this.teachers, 'name');
    console.log("teacher = ", this.teachers);
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};

</script>
