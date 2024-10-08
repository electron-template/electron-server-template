<template>
  <span>接收的消息:{{ onMsg }}</span>

  <div class="card">
    <input v-model="msg" type="text" placeholder="输入发送消息">
    <button style="margin-left: 20px" @click="sendMsg">
      发送
    </button>
  </div>
</template>


<script setup lang="ts">
import {onMounted, ref} from 'vue'
const msg = ref('')
const onMsg = ref('')

const sendMsg = async () => {
  const res=await window.ipcRenderer.invoke('request',{
    path:'/demo',
    data:msg.value
  });
  msg.value = '';
  onMsg.value = res
}

</script>


<style scoped>
.read-the-docs {
  color: #888;
}
</style>
