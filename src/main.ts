import { Plugin } from "obsidian";

const BASETAG = "basename-tag";

export default class TagRenderer extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((el: HTMLElement) => {
			// Find the original tags to render.
			el.querySelectorAll(`a.tag:not(.${BASETAG})`).forEach((a) => {
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

			// Remove the hash tags to conform to the same style.
			node.textContent = text
				.slice(text.lastIndexOf("/") + 1)
				.replaceAll("#", "");

			node.onclick = () => window.open(node.dataset.uri);

			return node;
		};

		// Remove class 'tag' so it doesn't get rendered again.
		el.classList.remove("tag");
		// Hide this node and append the custom tag node in its place.
		el.style.display = "none";
		el.parentNode?.insertBefore(createTagNode(el.textContent), el);
	}
}
