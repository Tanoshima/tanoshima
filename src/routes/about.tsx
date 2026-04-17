import { marked } from "marked";
import MarkdownPage from "~/components/MarkdownPage";
import aboutRaw from "../../content/about_me.md?raw";

const html = marked.parse(aboutRaw) as string;

export default function About() {
	return (
		<MarkdownPage
			title="AboutMe"
			html={html}
			prev={{ href: "/", label: "Readme" }}
		/>
	);
}
