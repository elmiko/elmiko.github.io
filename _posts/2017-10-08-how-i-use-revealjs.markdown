---
layout: post
title:  "How I use reveal.js"
date: 2017-10-08
categories:
---

I find making slidedecks to be a very personal art. Everyone has their own
tools they are comfortable with and even without trying we all end up
developing our own styles and ideologies. I love the diversity of tools and
range of techniques that exist and I've tried several different approaches for
creating decks, but there is one framework I keep returning to,
[reveal.js](https://github.com/hakimel/reveal.js.git).

Before I dive deeply into how I use reveal and share some of my experiences,
I just want to clearly state that I am not "blessing" one technology over
another and I fully respect the range of options that exist. What works well
for me may not work well for you.

## What is reveal?

Well, let's see what their docs say:

> A framework for easily creating beautiful presentations using HTML.

That sounds pretty straightforward, you can see a
[live demonstration here](http://lab.hakim.se/reveal-js/#/). Reveal gives you
a simple framekwork and tool kit for encoding your presentations as HTML and
CSS. Depending on how far from the standard layouts you wish to veer this
process can be simpler or more complex, but at the basic level the core of
your HTML file might look like this:

```
<div class="reveal">
    <div class="slides">
        <section>
            Slide 1
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
        </section>
        <section>
            Slide 2
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
        </section>
    </div>
</div>
```

This is very easy for me to understand but using HTML through the whole thing
might get a little verbose, luckily reveal adds a few helpers that allow
you to embed [Markdown](https://daringfireball.net/projects/markdown/)
directly into your source. Here's a quick example:

```
<div class="reveal">
    <div class="slides">
        <section data-markdown>
            <template data-template>
            # Slide 1

            * Item 1
            * Item 2
            </template>
        </section>
        <section data-markdown>
            <template data-template>
            # Slide 2

            * Item 1
            * Item 2
            </template>
        </section>
    </div>
</div>
```

Now our source material starts to look a little more manageable. This is just
the tip of the iceberg though, you can use all sorts of HTML and CSS to
customize the look of your decks. I have a decent familiarity with both of
these and although I wrestle to get things looking the way I want, I really
enjoy the nuts and bolts feeling of using the raw source primitives.

## Organizing decks

So now that my decks are all source code I might as well start using source
control tools to manage them. Thankfully, most of the decks that I create
are capable of being placed in the open source and I usually store them on
GitHub, [check em out](https://github.com/elmiko/slidedecks.git)!

The layout that I use for my repository is basically to have a `master` branch
with a readme about what the repo contains. Then I have a `reveal.js` branch
which tracks the upstream project. I have a branch named `redhat-theme` that
is forked from the upstream branch and contains a deck with some
graphics I use frequently. And finally I have individual
branches for each deck, these are each forked from the theme branch.

This layout has worked really well for me so far. I can update the upstream
reveal base whenever I need, I can create separate theme branches for special
events or if I need a light or dark theme, and all my old decks will continue
to work because they contain all the reveal source with them.

Setting this up for yourself is pretty simple and requires a little bit of
git-fu.

```
# create a new repository
git init myrepo

# make an initial commit
echo "a readme file" >> README
git add README
git commit -m "add a readme file"

# create a blank branch for the reveal upstream
git checkout --orphan reveal.js

# add the upstream as a remote source and fetch its code
git remote add upstream https://github.com/hakimel/reveal.js.git
git fetch upstream

# merge the upstream master into the new branch
git merge upstream/master
```

At this point your `reveal.js` branch contains all the commits of the upstream
project. If you switch back to the `master` branch you will see that only the
README file exists. The repo is now ready for adding more content. One of the
things to note about the upstream tracking branch is that we do not have to
track the tip of master, if we wanted we could pin to a specific version or
even create other branches to track those.

## Creating a new deck

When I start making a new deck I generall follow this workflow:

1. Update my upstream tracking branch

   I usually do this just to pick up bug fixes and new features. At this point
   reveal is very stable so it doesn't tend to add huge backward incompatible
   changes.
2. Rebase my theme branch

   If I update the upstream tracking branch then I also need to rebase my
   theme branch to ensure that I get the changes. There are occasionally
   conflicts when doing this rebase but it's never too bad.
3. Create a new branch from the theme

   This is where my files for the specific deck will go. I create a new branch
   from the theme and name it something like
   `<year>/<conference>-<short title>`.

4. Add deck files

   Now on my individual deck branch I begin adding source to the `index.html`
   file. I create a `deck` directory under the top level and put all my artwork
   and external source files into subdirectories.

## What about sharing?

As you can imagine, sharing the source decks is really easy if you are giving
them to people who will use a browser to view your deck. It can be a little
more difficult if you are required to share a specific format. Sometimes
conferences will ask for a copy of the deck that they can link, or your
colleagues might need copies.

If you are required to have your decks in something like PowerPoint or Google
Docs, then all of this is basically for naught. Using reveal does not make
much sense if you need to use those formats. But, if you can get away with
sharing PDF files then there are some options.

Sharing as a PDF is a perfectly fine option but your decks will not carry any
special animations or fragments that you have embedded with code. Your GIF
files and other pieces will make it through to the PDF but they can sometimes
get a little mangled in the process.

In the reveal docs there is
[a section on exporting to PDF](https://github.com/hakimel/reveal.js#pdf-export)
and this is the place to start. I generally have success with this method,
but when I use background images that have fine textures they don't always
come out nicely. I'm not sure what it is, but it appears like the rendering
engine is compressing the images in a lossly format and the detail gets all
jacked up. In those cases I usually turn off the background images.

Occassionaly, I have difficulty with CSS changes I have added to my decks that
behave poorly with the Chrome PDF export method. This is frustrating as I'm
not sure exactly what I'm doing to mess things up and I don't usally want to
debug too much. In these cases though, the
[decktape project](https://github.com/astefanutti/decktape) has helped me
immensely. It can be tricky to build from source and use but thankfully there
is a Docker image which can be used from the command line.

## But I like WYSIWYG editors!

Me too, they're really fun and can definitely improve productivity. If you've
been looking at all this code and thinking reveal is not for you, you might
be pleased to know there is an editor. It is an online only service and
requires you to create public decks for the free tier, but their tooling is
nice and you can export multiple formats from the web interface, including the
source files. So if you want to you can create presentations online and then
add them to your resource repository.

[Slides.com](https://slides.com/) has a WYSIWYG editor that will create reveal
based projects. I find the tool to be just as good as the Google slides
offering (which may be a good or bad thing depending on your perspective XD).
I occasionally experience minor hiccups with the online tool, like images and
elements not always lining up the way I like or not always being sure what has
been saved to the cloud. That said, the slides.com team does a great job and
I have noticed solid improvements over my years of using it. They frequently
fix bugs and add nice features, the presentor's view in specific is a big win.

## My future with reveal

I plan to continue using reveal for all my conference based decks. It's a
little more difficult with internal things as I need to share them in a manner
that other people feel comfortable editing or accessing. I'm
thankful that my employer has seen fit to provide the enterprise grade service
from slides.com, so I can share those but honeslty I don't end up using it
that much. I usually just use Google slides when creating something quick for
sharing.

As you can see, this topic is an interesting rat hole for me. I have several
different fronts that I work on, and the tools of each front provide different
capabilities. I suppose it might split my work habits a little, but I
enjoy the freedom of crafting with reveal and will continue to drive towards
it whenever I can.

I would like to understand more about how the code base works and get more
involved with the community effort. I do run across bugs and little bumps that
make my workflow slower, and I think it would be useful to contribute those
upstream. The most difficult part about all this is that when you are in
"crunch" mode to get a deck done before a presentation you don't always want
to take time debugging the deck framework.

Hopefully I can kick my own butt to give back a little, but ultimately I am
once again humbled and thankful at the opportunity to work with such awesome
open source software. Thank you to all the contributors out there who make our
lives better with your work =)
