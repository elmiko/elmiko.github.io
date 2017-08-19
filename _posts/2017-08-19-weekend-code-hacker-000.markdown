---
layout: post
title:  "Weekend Code Hacker 000: Beginning a new series"
date: 2017-08-19
categories:
---

Welcome to the first installment of the Weekend Code Hacker series!

For many months now I have been building a desire to improve my writing skills
and also to write a series of articles about projects I work on to satisfy my
personal interests in software development. I have also recently experienced a
nostalgia for the hacking days of my youth after unearthing relics of the
long ago while cleaning.

<img id="amiga" src="http://i.imgur.com/sS7f67Um.png" title="amiga books" class="center-block img-responsive"/>

In addition to those discoveries I was exposed to some really neat projects like
[Aiiee](https://www.youtube.com/watch?list=PL_8ByM2n4E2sh6yRvYuHVeW3flWc-3t_T&v=3IsSqVXLe3Q),
a new Apple II emulator by Tom Phelps, and the humorous continual
[Apple boot sequence](http://textfiles.com/appleboot/) over at
[textfiles.com](http://textfiles.com). Those two just helped to further my
meditations on a youth spent hacking code late into the evenings. Of weekends
spent dialing and re-dialing the modem until a connection would be made,
information would be exchanged, mirth would be made.

I think back fondly, but also with some trepidation about the early days of the
culture wars over the moniker "hacker". For me, there is a clear memory of this
label being something much more grand than the expectations we came to accept
after movies like [WarGames](https://en.wikipedia.org/wiki/WarGames) and
[Sneakers](https://en.wikipedia.org/wiki/Sneakers_(1992_film)). Those expectations,
that people declared as "hackers" by the authorities were somehow capable of superhuman
techno-magic that could empty all the banks in the world or start some sort of
nuclear holocaust.

<img id="2600" src="http://i.imgur.com/Ul3LJgbm.png" title="2600 magazine" class="center-block img-responsive" />

Which isn't to suggest that there aren't criminals out there who employ
computers to deprive others of their safety and peace of mind. There certainly
are. But for me, this is not the true essence of what my mind conjures when
I recall wistfully on those heady nights of fevered typing.

The ideals that I aspire to reach back towards are what I perceive to be some
of the core motivators that drove many of the early pioneers of the free and
open source software movement to create and share their works. The drive towards
exploration of this new mental landscape and the desire to share rewards won in
the hard fought battle of human will and machine logic. The wisdom that greater
depths of knowledge can be plumbed when collaborating with peers than
isolated from all contact.

I acknowledge this may be a fanciful view of the world, i tend to be an
optimist at heart.

<img src="http://i.imgur.com/9vCFeGmt.png" title="peace sign" class="img-responsive center-block" />

So in the spirit of the computer software hacker, exploring the boundaries of
cyberspace as if a nomad searching for an oasis on the horizon. And in the time
honored traditions of building and sharing, I am going to start writing about
some of my personal projects using the _**Weekend Code Hacker**_ title. My hope
is that the technical knowledge will be useful as a reference, and more
importantly that people will be encouraged to build their own creations and
investigate their own creativity in the digital space.

Although this initial edition is mostly me desribing my intentions and
making myself feel old, I do want to leave a little code to peruse =)

### **Making inline img elements toggle their source on click with javascript**
<hr>

<img src="https://static.opbstudios.com/img/elmikos-javascript-logo.svg" height="64" weight="64" class="pull-left" style="margin: 1em;">

When I started putting this post together I was intent on hosting my
images at [Imgur](https://imgur.com/about). This worked at first, but when I started
adding the thumbnail anchors to the full size images the links kept sending me
to landing pages at Imgur. I didn't really want this, I wanted to allow people to
click through to full size images without any extra content.

This really frustrated me, so I decided to build a little JavaScript function
into my page that would allow me to fix this usability error. So I wrote
the following function block in a separate file:

{% gist 5b837332078a67e18bfded77f2e571e6 %}

Now, this isn't a terribly complicated function and I'm not 100% sure that it
would be appropriate in an "enterprise" scenario, but it will suit my usage
just fine in this static page.

So what does it do? Well, quite simply it returns a function that will be used
for an `img` element's `onclick` handler. This handler function will change
the state of that `img` element's `src` parameter to toggle between two images. In
this manner, I can still use Imgur to host my images but allow a quick toggle
to occur in-line. Try it now, click on the images of the books or magazine
earlier in this post.

The key to this function working is the variable on line 6 which records the
initial alternate image source in the closure outside the returned function. If
you are curious about closures and how they work in JavaScript, check out [this
article on Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
on the most excellent MDN Web Docs site.

Between that variable, and the `src` property on the `img` element in the HTML
I am able to create 2 locations to store state and thus create the toggle
effect on a click event. See lines 9 through 14.

Finally, to make all this work in my page I need a couple pieces of markup.
First I need to include my source file, then I need at add `id` parameters
to the images I wish to toggle, and finally I need to add the `onclick` handlers
to the elements. You can see all that in the following snippet:

{% gist da3a6294954c22ccd8fff406c0e020cd %}

On line 1 you can see that my `img` element has been given the id of `amiga`.
This identifier is used in the `window.onload` function that I declare in the page script
to get an object representation of the `img` element, as you can see on line 5.
Then on line 6 I set its `onclick` attribute to use the handler function
created by my `imgclicker` function. I pass in the URL to the
full size image that I wish to toggle.

You might be wondering why I have declared the JavaScript to modify my `img`
element before the actual link to include the function's source file and
how this works. It is all down to the behavior of the `window.onload` function
which will only be called once the page's DOM has been fully loaded. For a
more extended conversation about the DOM and events,
[this Introduction to the DOM article](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)
is a great starting point.

And with that, I think I'm gonna wrap this hack up, I hope you enjoyed the
read. In the next installment I will begin talking about a REST-based URL
bookmark microservice that I am writing in Python using the Django framework.

Until then, happy hacking =)

_If you like my JavaScript logo, it is available
[in SVG format here](https://github.com/elmiko/elmikos-javascript-logo) and is
licensed <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>_

<script>
window.onload = function() {
  var image = document.getElementById("amiga");
  image.onclick = imgclicker("http://i.imgur.com/sS7f67U.png");
  image = document.getElementById("2600")
  image.onclick = imgclicker("http://i.imgur.com/Ul3LJgb.png");
};
</script>
