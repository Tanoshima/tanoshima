import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Sidebar from "~/components/Sidebar";
import "~/styles/main.css";

export default function App() {
	return (
		<Router
			base="/tanoshima"
			root={(props) => (
				<div class="book with-summary">
					<Sidebar />
					<div class="book-body">
						<div class="body-inner">
							<Suspense>{props.children}</Suspense>
						</div>
					</div>
				</div>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
