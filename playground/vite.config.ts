import react from "@vitejs/plugin-react-swc";
import commentMock from "unplugin-comment-mock/vite";
import { defineConfig, type PluginOption } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
	const isDev = command === "serve";
	return {
		plugins: [isDev ? (commentMock() as PluginOption[]) : null, react()].filter(
			Boolean,
		),
	};
});
