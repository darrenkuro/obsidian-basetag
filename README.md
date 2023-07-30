# Obsidian Base Tag Renderer

This plugin renders only the basename for tags while maintaining the nested strucutres elsewhere.

It also appends a new class name (`basename-tag`) so it's possible to add custom style to it.

![](pic/basetag.gif)

The custom css applied for the above example -

```css
a.basename-tag[href*="animal"]::before{
    content: "😍 ";
}
a.basename-tag[href*="cat"]::before {
    content: "🐱 ";
}
a.basename-tag[href*="dog"]::before {
    content: "🐶 ";
}
```

# Version 1.2 (July 30th, 2023)

- Add text change for tags in property as well.

# Version 1.1 (Feb 23rd, 2023)

- Add support for editor mode including tags in the frontmatter.

