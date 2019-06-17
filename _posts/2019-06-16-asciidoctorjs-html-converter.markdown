---
layout: post
title:  "Custom Asciidoctor.js html converter with Nunjucks templates"
date: 2019-06-16
categories:
---

**Many thanks to Github user [@Mogztter](https://github.com/Mogztter) for
showing me this code and pointing me the right direction.**

I needed to add a custom templating system to the
[stasis-reactor](https://gitlab.com/elmiko/stasis-reactor) project and was
[having some difficulty](https://github.com/asciidoctor/asciidoctor.js/issues/735)
with the current tech stack I have chosen. After a brief and enlightening post
from @Mogztter, I was quickly able to put together a branch for adding this
functionality.

This code will use the [Asciidoctor.js project](https://github/asciidoctor/asciidoctor.js)
to load an Asciidoc formatted file and then convert that file into HTML using
the [Nunjucks](https://mozilla.github.io/nunjucks/) template language as a
final conversion engine.

This code will convert the Asciidoc at the Document entity level and pass that
to the Nunjucks converter. It passes the
[document object](https://asciidoctor.github.io/asciidoctor.js/master/#document)
to the Nunjucks template as a variable named `context`.

```
const asciidoctor = require("asciidoctor.js")();
const nunjucks = require("nunjucks");

nunjucks.configure({autoescape: false});

const template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>{{ context.getDoctitle() }}</title>
  </head>
  <body>
    <h1>{{ context.getDoctitle() }}</h1>
    {{ context.getContent() }}
  </body>
</html>`;

class TemplateConverter {
  constructor () {
    this.baseConverter = asciidoctor.Html5Converter.$new();
    this.templates = {
      document: (node) => nunjucks.renderString(template, {context: node})
    };
  }

  convert (node, transform, opts) {
    const template = this.templates[transform || node.node_name];
    if (template) {
      return template(node);
    }
    return this.baseConverter.convert(node, transform, opts);
  }
}

asciidoctor.ConverterFactory.register(new TemplateConverter(), ["html5"]);
var adoc = asciidoctor.convertFile("./example1.adoc");
```

With this as the starting point I was quickly able to add a little more
sugar to allow the Nunjucks template to be stored in an external file. This
now opens up an easy avenue for stasis-reactor users to customize
their document output.
