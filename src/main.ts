import { Plugin } from "obsidian";

export default class TagRenderer extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((el: HTMLElement) => {
			el.querySelectorAll("a.tag").forEach((a) => {
				a.className.includes("basename-rendered")
					? null
					: this.formatTag(a as HTMLAnchorElement);
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

			// Remove the hash tags to conform to the same style.
			node.textContent = text
				.slice(text.lastIndexOf("/") + 1)
				.replaceAll("#", "");

			node.onclick = () => window.open(node.dataset.uri);

			return node;
		};

		// Tag it as rendered.
		el.classList.add("basename-rendered");

		// Hide this node and append the custom tag node in its place.
		el.style.display = "none";
		el.parentNode?.insertBefore(createTagNode(el.textContent), el);
	}
}
