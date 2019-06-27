---
layout: post
title:  "Adding HTTP headers to a Netlify static site"
date: 2019-06-27
categories:
---

Recently I have been using the
[Mozilla Observatory](https://observatory.mozilla.org/) to do some security
hunting on a community site I work on (https://radanalytics.io). It's a really
interesting tool, but it might make you sad when you first check your _baby_
out.

<img src="/img/radio-observatory-1.png" class="img-responsive center-block" alt="d+ rating">

_ouch_

Well, I had some work ahead of me. As it turns out, most of the issues we had
were around the [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
that the site was sending. Given that this site is deployed as a set of
static HTML files (produced via [Jekyll](https://jekyllrb.com)) on
[Netlify](https://www.netlify.com), I wasn't sure that there was much hope
that we would be able to modify the headers.

One available option in this scenario is to use the HTML
[`META`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) tag
to inject a header value from the HTML source. Unfortunately, it appears that
this is only really useful for the
[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
header, and even then some browsers may ignore the tag.

Additionally, the `META` tag can cause other issues like not being able to
test the site locally very easily. For example, if I specify in the tag that
all content must be served from a secure socket connect, then when I test
locally I will need to have a way to use an https connection on my development
machine. Not an impossible task, but it doesn't help new people who want to
contribute to the project.

Thankfully, after some searching around I found this
[article about headers and basic authentication](https://www.netlify.com/docs/headers-and-basic-auth/)
in the Netlify docs. Basically, it says that you can instruct the Netlify
servers to send specific headers by adding a file to the root of your site
deployment named `_headers`. With this info I was off to the races.

After a good 2 days of reading, hacking, debugging, and repeating I was finally
happy with the headers I had crafted for the site. You can see the final result
here:

**`_headers`**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.google-analytics.com; object-src 'none'; frame-ancestors 'none'; style-src 'self' 'unsafe-inline'; frame-src 'self' https://player.vimeo.com https://www.youtube.com https://ghbtns.com; img-src 'self' https://www.google-analytics.com https://asciinema.org
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block

/*.svg
  Content-Security-Policy: default-src https: 'unsafe-eval' 'unsafe-inline'

/*/lightning/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; object-src 'none'; frame-ancestors 'none'; style-src 'self' 'unsafe-inline'; frame-src 'self' https://player.vimeo.com; img-src 'self' https://www.google-analytics.com
```

pretty crazy huh? I'm not going to explain them all, you can find most of the
advice given by the Observatory on
[Mozilla's page about web security](https://infosec.mozilla.org/guidelines/web_security).
The big win though was the final result:

<img src="/img/radio-observatory-2.png" class="img-responsive center-block" alt="a+ rating">

_huzzah!_

At this point I was pretty happy and decided to put down my editor and vcs.
I think there are one or two more tweaks that could be added to the site, but
I am happy for now.

