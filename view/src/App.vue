<template>
  <div style="width: 100vw; height: 100vh">
    <el-config-provider :locale="zhCn" :empty-values="[undefined]">
      <RouterView/>
    </el-config-provider>
  </div>
</template>
<script setup lang="ts">
import {RouterView,useRouter} from 'vue-router';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import {onMounted} from "vue";
onMounted(()=>{
  // const router = useRouter();
  // console.log(location.href);
  // router.push('/').then(()=>{
  //   console.log(location.href);
  // });
})
</script>
<style>
</style>
