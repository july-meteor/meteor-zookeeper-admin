<template>
 <zookeeper :authortiy="authortiy"></zookeeper>
</template>

<script>
  import { mapGetters } from 'vuex'
  import zookeeper from './zookeeper/index'
    export default {
        name: "meteor-curator-index",
        components:{
          zookeeper,
        },
      data(){
          return {
            authortiy:undefined,
          }
      },
      computed: {
        ...mapGetters([
          'roles'
        ])
      },
      created() {


        if (!this.roles.includes('admin')) {
          console.log(this.roles)
            this.authortiy = {
              btn_add:false,
              btn_edit: false,
              btn_del:false
            }
        }
      }
    }
</script>

<style scoped>

</style>
