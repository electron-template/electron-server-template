import {createApp} from 'vue'
import App from './App.vue'


//#region 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
//#endregion

import './assets/styles/main.css'
// 暂时注释,开启这个修改默认主题会收到element里样式错误的警告
// import '@/assets/styles/element/index.scss'
import router from './router'

//#region 初始化
const app = createApp(App);

//#endregion
// 注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
//#region 使用插件
const plugins=[
    ElementPlus,
    router];
plugins.forEach(plugin=>{
    app.use(plugin)
})
//#endregion


app.mount('#app')
    .$nextTick()
    .then(() => {
        postMessage({payload: 'removeLoading'}, '*')
    })


