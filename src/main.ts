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

const getVaultName = () => window.app.vault.getName();

// Create a custom tag node.
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
					if (node.name.contains("hashtag-end")) {
						const extendedFrom = node.from - 1;
						const extendedTo = node.to + 1;
						// Ignore if falls under selection range
						for (const range of view.state.selection.ranges) {
							if (extendedFrom <= range.to && range.from < extendedTo) {
								return;
							}
						}
						const text = view.state.sliceDoc(node.from, node.to);
						console.log(text);
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

export default class TagRenderer extends Plugin {
	async onload() {
		// For editor in livepreview state.
		this.registerEditorExtension(this.editorExtension(this));

		// For preview state.
		this.registerMarkdownPostProcessor((el: HTMLElement) => {
			// Find the original tags to render.
			el.querySelectorAll(`a.tag:not(.${BASETAG})`).forEach((a) => {
				this.previewFormatter(a as HTMLAnchorElement);
			});
		});
	}

	private previewFormatter(el: HTMLAnchorElement) {
		// Remove class 'tag' so it doesn't get rendered again.
		el.removeAttribute("class");
		// Hide this node and append the custom tag node in its place.
		el.style.display = "none";
		el.parentNode?.insertBefore(createTagNode(el.textContent), el);
	}

	private editorExtension(plugin: TagRenderer) {
		return ViewPlugin.fromClass(editorPlugin, {
			decorations: (value) => value.decorations,
		});
	}
}
