---
layout: post
title:  "Executing jobs in Sahara through Horizon"
date:   2014-10-24
categories:
---

Prompted by user hogepodge in an IRC discussion I created a video demonstrating
how to run a basic job in Sahara through Horizon. The video shows the
execution of the [example PIG job][1] from the Sahara source base. It does
not go into the configuration of the stack necessary for this, but does show
everything from image registration on inside Sahara.

This is my first screencast and the audio is a little off, so I apologize up front. There is also a small lul in activity during the actual job running phase
and I was experiencing a minor UI glitch(see if you can spot it). Overall I'm
happy with how it turned out and hopefully it will be useful.

<div class="embed-responsive embed-responsive-16by9">
<iframe src="//player.vimeo.com/video/109935664" class="embed-responsive-item" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
</div>
<p>
<a href="http://vimeo.com/109935664">OpenStack Sahara basic usage</a>
from
<a href="http://vimeo.com/elmiko">elmiko</a>
on
<a href="https://vimeo.com">Vimeo</a>.
</p>

Images from the Sahara documentation pages for the vanilla plugins can be
found at
[http://docs.openstack.org/developer/sahara/userdoc/vanilla_plugin.html][2].


[1]: https://github.com/openstack/sahara/tree/master/etc/edp-examples/pig-job
[2]: http://docs.openstack.org/developer/sahara/userdoc/vanilla_plugin.html
