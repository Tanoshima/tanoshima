import { marked } from "marked";
import MarkdownPage from "~/components/MarkdownPage";
import readmeRaw from "../../content/readme.md?raw";

const html = marked.parse(readmeRaw) as string;

export default function Top() {
	return (
		<MarkdownPage
			title="Readme"
			html={html}
			next={{ href: "/about", label: "AboutMe" }}
		/>
	);
}
