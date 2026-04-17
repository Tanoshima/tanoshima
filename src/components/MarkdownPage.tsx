import { A } from "@solidjs/router";
import type { JSX } from "solid-js";

interface Props {
	title: string;
	html: string;
	prev?: { href: string; label: string };
	next?: { href: string; label: string };
}

export default function MarkdownPage(props: Props): JSX.Element {
	return (
		<>
			<div class="book-header">
				<h1>{props.title}</h1>
			</div>
			<div class="page-wrapper">
				<div class="page-inner">
					<section class="markdown-section" innerHTML={props.html} />
				</div>
			</div>
			<div class="navigation">
				{props.prev && (
					<A
						href={props.prev.href}
						class="navigation-prev"
						aria-label={`Previous: ${props.prev.label}`}
					>
						‹
					</A>
				)}
				{props.next && (
					<A
						href={props.next.href}
						class="navigation-next"
						aria-label={`Next: ${props.next.label}`}
					>
						›
					</A>
				)}
			</div>
		</>
	);
}
