import { Plugin } from "obsidian";

const postProcssor = (el: HTMLElement, ctx: any) => {
	el.querySelectorAll("a.tag").forEach((a) =>
		formatTag(a as HTMLAnchorElement)
	);
};

const formatTag = (el: HTMLAnchorElement) => {
	const removeHashTag = (s: string) => s.replaceAll("#", "");
	const formatText = (text: string) =>
		removeHashTag(text.slice(text.lastIndexOf("/") + 1));

	const createTagNode = (text: string | null) => {
		const node = document.createElement("a");
		if (!text) return node;
		node.className = "tag";
		node.target = "_blank";
		node.rel = "noopener";
		node.href = text;
		node.dataset.uri = `obsidian://search?query=tag:${removeHashTag(text)}`;
		node.textContent = formatText(text);
		node.onclick = (e: MouseEvent) => window.open(node.dataset.uri);

		return node;
	};

	el.style.display = "none";
	el.parentNode?.insertBefore(createTagNode(el.textContent), el);
};

export default class TagsRenderer extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor(postProcssor);
	}
}
