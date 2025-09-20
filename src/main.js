import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import "./index.css"
import "leaflet/dist/leaflet.css"
import "@/utils/geoAnimation/L.Icon.Pulse.css"
import "lightbox2/dist/css/lightbox.css"
import "lightbox2/dist/js/lightbox.js"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.mount("#app")
