# Obsidian Base Tag Renderer

This plugin renders the only the basename of tags in preview mode while maintaining nested strucutre elsewhere.

![](pic/basename.git)

It also appends a new class name (`basename-tag`) so it's possible to add custom style to it. 

For example, adding the following css can make rendered tags to show an emoji according to what's including in the path.

```css
a.basename-tag[href*="cat"]::before {
    content: "🐱 ";
}
a.basename-tag[href*="dog"]::before {
    content: "🐶 ";
}
```

![](pic/style.png)