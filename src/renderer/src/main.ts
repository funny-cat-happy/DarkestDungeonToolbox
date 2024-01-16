import { createApp } from 'vue'
import App from './App.vue'
import router from '@renderer/routes'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import i18n from './i18n'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.use(ContextMenu)
app.mount('#app')
