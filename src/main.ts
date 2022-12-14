import { Plugin } from "obsidian";

export default class TagRenderer extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((el: HTMLElement) => {
			console.log(el);
			el.querySelectorAll("a.tag").forEach((a) => {
				this.formatTag(a as HTMLAnchorElement);
			});
		});
	}

	private formatTag(el: HTMLAnchorElement) {
		/** Create a custom tag node. */
		const createTagNode = (text: string | null) => {
			const node = document.createElement("a");
			if (!text) return node;

			node.className = "tag basename-tag";
			node.target = "_blank";
			node.rel = "noopener";
			node.href = text;

			node.dataset.uri = `obsidian://search?vault=${encodeURIComponent(
				this.app.vault.getName(),
			)}&query=tag:${encodeURIComponent(text)}`;
			node.textContent = text.slice(text.lastIndexOf("/") + 1);
			node.onclick = () => window.open(node.dataset.uri);

			return node;
		};

		el.style.display = "none";
		el.parentNode?.insertBefore(createTagNode(el.textContent), el);
	}
}
