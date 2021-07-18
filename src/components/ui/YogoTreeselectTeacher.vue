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
  // props: ['value'],
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
    value() {
      let val = []
      if (this.teachers.length) {
        console.log("ok: ", this.teachers.length);
        for (const i in this.teachers) {
          val.push(this.teachers[i].id);
        }
      }
      return val;
    },
  },
  async created() {
    this.teachers = await YogoApi.get(
          '/users' +
          '?teacher=1' +
          '&populate[]=image',
      );
    this.teachers = _.sortBy(this.teachers, 'name');
  },
  mounted() {
    console.log("mounted : ", this.treeSelectTeachersOptions)
  },
  methods: {
    updateValue(newValue) {
      console.log("newValue : ", newValue);
      let selectedTeachers = [];
      for (const i in this.teachers) {
        for (const j in newValue) {
          if (this.teachers[i].id == newValue[j]) {
            selectedTeachers.push({"id": this.teachers[i].id, "name": this.teachers[i].first_name + " " + this.teachers[i].last_name, classes: [], folded: true});
            break;
          }
        }
      }
      this.$emit('update:teachers', selectedTeachers);
    },
  },
};

</script>
