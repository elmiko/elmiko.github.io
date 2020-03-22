---
layout: post
title: "Exploring the Kubernetes OpenAPI Definition"
subtitle:  ""
date: 2020-03-22
categories:
---


I was having a discussion with friend and colleague [Erik Erlandson](https://erikerlandson.github.io/)
recently wherein we were enumerating some user experience hurdles with the
[Kubernetes API](https://kubernetes.io/docs/reference/using-api/api-overview/).
Our conversation was primarily focused on the difficulties that new developers
and operators experience when working this API, and specifically how to know
which fields in a given resource's schema are useful.

One of the issues we dove in on is knowing what you originally submitted as a resource
manifest versus what the API server has in its stores. There are several fields
that are updated automatically by various controllers within Kubernetes, and
for good reason (e.g. think about the timestamps). There may exist
some tooling for viewing these types of differences, certainly a user could
utilize any number of templating options as a start, but when first learning
and exploring the API it is really helpful to know what the fields in a
resource mean, are they required, what types do they accept, and so on.

Naturally, my reaction to this is that the
[API reference document](https://kubernetes.io/docs/reference/using-api/api-overview/)
_has_ all this information just a few clicks away. We both agreed though that
the formatting of the documentation, while extremely useful for people with
experience around RESTful APIs and JSON structured data formats, can be quite
daunting for a newcomer.

<img src="/img/k8s-pod-api-doc.png" class="img-responsive center-block" alt="api docs for pod spec">

When we explored the documentation from this perspective we quickly started
talking about the tooling we are using and what things we commonly do. A
specific point that came up was that it would be nice to have a quick way
to create a manifest for any given resource. Now, again, this is where a
library of template objects could be used, but we were talking more about
quick copy/paste examples with the main required keys and values. And in fact
even the example above shows links to kubectl and curl examples, but still
these are not quite what we were driving towards.

I enjoy messing around with these types of APIs, and I've spent some of my
free time creating tools to interact with OpenAPI specifications and the
various transformations that can result from there. So I started considering
how difficult would it be to create a simple application that could extract
definitions from an OpenAPI schema and then display them for exploration
and copying.

Enter my hairy friend [Bilbo Swaggins](https://gitlab.com/elmiko/swaggins.py),
_don't ask, I was feeling especially punchy when I declared I was using this
name and I'm sticking with it!_, a simple tool for exploring and whatnot.

<img src="/img/swaggins-demo1.gif" class="img-responsive center-block" alt="short screencast of swaggins in action">

Over the course of a weekend or two, I was able to put this together using
Python with Curses and PyYaml. It is still quite rough around the edges but
it allows a simple navigation of all the "definition" entries from an OpenAPI
schema. You can then view an example of each definition with types filled in
instead of values. Lastly you can copy the text of a definition to the system
clipboard with a single key.

Although this app is bog simple, and still quite rough around the edges, I've
already found myself using it to explore various bits where I previously would
have gone to the online API documentation. It still needs some love around the
display routine (the screen flashing is kinda annoying), and I would really
like to figure out a way to browse each definition such that you could see
the metadata associated with an entry. Additionally, being able to mark or
exclude non-required fields would be nice.

Anyways, I don't think any of this is particularly new, there certainly
exists a wealth of [OpenAPI tooling](https://openapi.tools/). I could
probably find a similar solution, but that would defeat the fun of looking
around, learning a little more, and creating something. I like to think
that exploring the API definition in this manner is exposing me to bits I
haven't quite seen before, and also forcing me to remember how to do some
classic computer science related algorithms.

Thanks for listening, hope you had fun and maybe got inspired to explore the
APIs in your life ;)

stay safe and healthy out there, and as always happy hacking!
