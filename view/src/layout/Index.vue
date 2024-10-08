<template>
  <el-menu :ellipsis="false" :default-active="defaultTab" mode="horizontal" router>
    <el-sub-menu v-for="(route,index) in routes" :index="index+''">
      <template #title>{{ route.name }}</template>
      <el-menu-item v-for="child in route.children" :index="`/${route.path}/${child.path}`">
        {{child.meta?.title || child.name}}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
  <el-container>
    <!--    <el-header></el-header>-->
    <el-container>
      <el-main class="mian-content">
        <transition name="fade">
          <router-view v-slot="{ Component, route }">
            <keep-alive>
              <component :is="Component" :key="route.path" v-if="route.meta.keep"/>
            </keep-alive>
            <component :is="Component" :key="route.path" v-if="!route.meta.keep"/>
          </router-view>
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { ref, computed, reactive } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
const routes = reactive(router.options.routes[0].children)
const defaultTab = computed(() => router.currentRoute.value.path)
</script>

<style lang="scss" scoped>
</style>
