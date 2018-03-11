---
layout: post
title:  "Weekend Code Hacker 002"
subtitle: "On the topic of off-hours coding and supercharing my TODO list"
date: 2018-03-11
categories:
---

I recently read a conversation on Twitter that really got me thinking about
my personal coding habits and the path I've taken to build my skills.

<blockquote class="twitter-tweet tw-align-center" data-lang="en"><p lang="en" dir="ltr">I say this occasionally to normalize it:<br><br>I’ve never put code on GitHub<br>I’ve never done coding in my spare time for fun, side project, or portfolio<br>I’ve had a successful career as a developer<br><br>If you have done those things— great! Maybe I will too one day. But it isn’t necessary.</p>&mdash; Stephanie Hurlburt 🔜 GDC (@sehurlburt) <a href="https://twitter.com/sehurlburt/status/969814787428302850?ref_src=twsrc%5Etfw">March 3, 2018</a></blockquote>

I chewed on this one for a few but ultimately agree with what Stephanie is
talking about. From the comments, it's easy to see that it had hit a nerve
for some, and I think I can empathize with their reactions. There is
definitely a culture of hard work that I've experienced in the software
engineering community that often times measures an individuals' worth by how
much extracurricular activity their GitHub feed is displaying. I know I've
been caught in this cycle as well, but I don't think it's healthy for the
community or the industry.

And yet, that said, I do love me some off-hours coding. The computer has
always held a unique fascination for me, and I love spending much of my free
time exploring computing topics and creating little projects that most likely
will not change the world, or even make it to a version 1.0. It's the reason
why tweets like this one totally get me fired up, I revel in the pure passion
of using the computer as a tool for enjoyment:

<blockquote class="twitter-tweet tw-align-center" data-lang="en"><p lang="en" dir="ltr">This is kind of a casual drop by kind of video  but when the 81 year old genius abstract painter Palestinian refugee shows the Amiga 1000 program she wrote where pixels are wiped away and refers to that effect as an “exodus” it exploded my entire brain <a href="https://t.co/njCYVHCnfG">https://t.co/njCYVHCnfG</a></p>&mdash; Paul Ford (@ftrain) <a href="https://twitter.com/ftrain/status/971221721012428800?ref_src=twsrc%5Etfw">March 7, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

First of all, wow. I mean WOW! Samia is like my new hero. I have been
programming for fun and for profit for the majority of my life and Samia has
completely shattered my world, in a good way.

These posts really got me excited in different ways. In the case of
Stephanie's, I really reflected on what I love about programming and the joy
it brings me. And in the case of Paul's post about Samia, it was the thrill
of seeing a lifelong learner and artist with such zeal _(it also doesn't
hurt that I am a sucker for Amigas)_. So, I went back through my notebook of
hairbrained ideas and found a page from several years ago that stuck out as
something I could do for a nice day project:


<img src="https://i.imgur.com/MMSuenD.png" style="max-width: 640px;" class="img-responsive center-block" alt="notebook">

In case that is difficult to read, it says across the top
"single file html/javascript issue tracker/todo list". I'm not sure what I was
thinking when I wrote this down but I appear to have spec'd out some sort
of thing that I thought would help me out. I know there are a number of
great solutions in this space already, but often times I like to pick a
problem to work on that just sounds fun to me. Apprently "to do" lists and
issue trackers are fun.

When looking at this idea though, it all came together for me. I've been
working to learn the [Vue.js](https://vuejs.org/) framework for awhile now and
I also like the simplicity of the [Patternfly](http://www.patternfly.org/)
UI framework. Together, these two pieces of tech would, hopefully, make for a
fun and quick project.

Something that I like about both Vue and Patternfly is that they can be easily
embedded in a web page and do not require a preprocessing build phase before
deployment. I had not tried this with Vue before and it seemed like a good
challenge, I especially like the fact that even though Vue is a reactive
framework it can be used straight from the HTML by including their JavaScript
module.  My single page application, which I was now referring to as "Chicken Scratch",
would be a perfect playground for this exploration.

With the basics of Vue and Patternfly in place, my page looked like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/patternfly/3.24.0/css/patternfly.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/patternfly/3.24.0/css/patternfly-additions.min.css">

</style>
  </head>
  <body>
    <nav class="navbar navbar-default navbar-pf" role="navigation">
      <div class="navbar-header" id="brand-image">
      </div>
    </nav>
    <div class="container">
      <div id="app">
        {% raw %}{{ message }}{% endraw %}
      </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/patternfly/3.24.0/js/patternfly.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script>
var app = new Vue({
  el: '#app',
  data: {
    message: 'foo bar baz'
  }
})
</script>

  </body>
</html>
```

I thought it was really cool how Vue, Patternfly, Bootstrap and JQuery are
all able to be served from content distribution networks, making the deployment
of this "application" all self-contained within a single page. No need for a
server to deploy and serve this page, it can simply be loaded into a browser
through the open file dialog.

At this point my application was mainly just a hello world type skeleton, but
after a few hours of tweaking and wrestling with the HTML, I ended up with
something much more usable:

<img src="https://i.imgur.com/GBR5oLz.png" style="max-width: 800px;" class="img-responsive center-block" alt="notebook">

Sweet! I was well on my way to having a nice simple list application, all in
a single page that could be used from a file. I had added the bits for crud
operations on item entries, showing a list display, and some local storage
functionality using the
[DOM Storage interface](https://html.spec.whatwg.org/multipage/webstorage.html#the-storage-interface),
which at least allowed my list to stick around between usages. I would like to
expand the storage capabilities, perhaps with an export/import option for
making the item list more portable. I'm even considering something that would
integrate a pastebin or gist as a storage backend, I think that would be cool.

In addition to functional changes, I was also able to hack up a simple brand
logo image in [Inkscape](https://inkscape.org) and saved it as a scalable
vector graphics(SVG) file. After I trimmed out some of the kruft, this file
was embeddable as an image inside my HTML.

This style of application building is an interesting approach to
explore. There are surely several more hurdles I will need to clear before I
could build really rich applications in this style, but I'm intrigued. Also,
many kudos to all the folks who worked on the projects that made this so easy
to setup and run.

If you are thinking about trying something like this or just want to play
around in the sandbox, here are some links I highly recommend:

* Mozilla Developer Network documentation [https://developer.mozilla.org](https://developer.mozilla.org)
* Vue.js JavaScript Framework [https://vuejs.org/](https://vuejs.org/)
* Patternfly UI Framework [http://www.patternfly.org/](http://www.patternfly.org/)
* Bootstrap UI Component Library [https://getbootstrap.com/](https://getbootstrap.com/)
* JQuery JavaScript Library [https://jquery.com/](https://jquery.com/)

And lastly, here is a link to Chicken Scratch so you can checkout where I
ended up after a day of hacking, and hopefully where I will go.

* Chicken Scratch [https://gitlab.com/elmiko/chicken-scratch](https://gitlab.com/elmiko/chicken-scratch)

To bring this back around full circle, to Stephanie's message that got me
thinking about doing these things in the first place. I do not think these
side projects and explorations are essential to advancing in the software
industry. I definitely do not think we should be using them as a measuring
stick for who the top talent will be. It's hard not to acknowledge the work
that those of us whose hobby computing overlaps with professional computing
have done, but I certainly hope it doesn't color the industry for the worse.
I believe that computers and the technological revolution of which they are a
part can be a huge boon to humanity. It can provide a means out of poverty for
many and also be a tremendous source of joy. I wish Stephanie luck in the
quest for normalization in the software engineering world, I know I'll do my best
to treat colleagues fairly and honestly regardless of their off-hour activities.

as always, happy hacking!
