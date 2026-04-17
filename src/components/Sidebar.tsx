import { A } from "@solidjs/router";

const pages = [
	{ href: "/", label: "Readme" },
	{ href: "/about", label: "AboutMe" },
];

export default function Sidebar() {
	return (
		<div class="book-summary">
			<nav>
				<ul class="summary">
					{pages.map((p) => (
						<li class="chapter">
							<A href={p.href} end={p.href === "/"} activeClass="active">
								{p.label}
							</A>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
