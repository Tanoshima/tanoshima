import { createMiddleware } from "@solidjs/start/middleware";

export default createMiddleware({
	onRequest: [
		(event) => {
			const url = new URL(event.request.url);
			if (url.pathname === "/") {
				return new Response(null, {
					status: 301,
					headers: { Location: "/tanoshima/" },
				});
			}
		},
	],
});
