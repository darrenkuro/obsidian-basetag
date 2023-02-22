import { Plugin } from "obsidian";
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { livePreviewState } from "obsidian";

const BASETAG = "basename-tag";

/** Get the current vault name. */
const getVaultName = () => window.app.vault.getName();

/** Create a custom tag node from text content (can include #). */
const createTagNode = (text: string | null) => {
	const node = document.createElement("a");
	if (!text) return node;

	// Keep the 'tag' class for consistent css styles.
	node.className = `tag ${BASETAG}`;
	node.target = "_blank";
	node.rel = "noopener";
	node.href = text;

	const vaultStr = encodeURIComponent(getVaultName());
	const queryStr = `tag:${encodeURIComponent(text)}`;
	node.dataset.uri = `obsidian://search?vault=${vaultStr}&query=${queryStr}`;

	// Remove the hash tags to conform to the same style.
	node.textContent = text.slice(text.lastIndexOf("/") + 1).replaceAll("#", "");

	node.onclick = () => window.open(node.dataset.uri);

	return node;
};

/** Create a tag node in the type of widget from text content. */
class TagWidget extends WidgetType {
	constructor(private text: string) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		return createTagNode(this.text);
	}
}

class editorPlugin implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate): void {
		if (
			update.view.composing ||
			update.view.plugin(livePreviewState)?.mousedown
		) {
			this.decorations = this.decorations.map(update.changes);
		} else if (update.selectionSet || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	private buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					// Known issues: do not support live preview in some cases (i.e. under callout list)
					// Do not support frontmatter (fixable)

					// Handle tags that's in the main content.
					if (node.name.contains("hashtag-end")) {
						// Do not render if falls under selection (cursor) range.
						const extendedFrom = node.from - 1;
						const extendedTo = node.to + 1;

						for (const range of view.state.selection.ranges) {
							if (extendedFrom <= range.to && range.from < extendedTo) {
								return;
							}
						}

						const text = view.state.sliceDoc(node.from, node.to);
						const lastIndex = text.lastIndexOf("/");
						if (lastIndex < 0) {
							return;
						}

						builder.add(
							node.from - 1,
							node.to,
							Decoration.replace({
								widget: new TagWidget(text),
							}),
						);
					}
				},
			});
		}

		return builder.finish();
	}
}

export default class TagRenderer2 extends Plugin {
	async onload() {
		this.registerEditorExtension(
			ViewPlugin.fromClass(editorPlugin, {
				decorations: (value) => value.decorations,
			}),
		);

		this.registerMarkdownPostProcessor((el: HTMLElement) => {
			// Find the original tags to render.
			el.querySelectorAll(`a.tag:not(.${BASETAG})`).forEach(
				(node: HTMLAnchorElement) => {
					// Remove class 'tag' so it doesn't get rendered again.
					node.removeAttribute("class");
					// Hide this node and append the custom tag node in its place.
					node.style.display = "none";
					node.parentNode?.insertBefore(createTagNode(node.textContent), node);
				},
			);
		});
	}
}
