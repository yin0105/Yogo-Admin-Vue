<template>

  <classtypeform :formType="'add'"></classtypeform>

</template>

<script>

    import ClassTypeForm from './ClassTypeForm'

    export default {
        name: 'classtypeadd',
        components: {
            classtypeform: ClassTypeForm
        }
    }

</script>