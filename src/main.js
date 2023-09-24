import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import 'default-passive-events'
export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
