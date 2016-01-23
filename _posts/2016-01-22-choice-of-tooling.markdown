---
layout: post
title:  "On the subject of development tools"
date:   2016-01-22
categories:
---

During a recent video conference watercooler,
[Jay Vyas](http://jayunit100.blogspot.com) was telling us about his
upcoming tech talk on development tools, and what he has learned
over the course of several editors, IDEs and operating systems.

While the thrust of his talk is on
[IntelliJ](https://www.jetbrains.com/idea/) and using it with
[Scala](http://www.scala-lang.org/) and [Go](https://golang.org/), he
brought up some issues that he's had in the past with using
[Vim](http://www.vim.org/). Mainly, that he had run into several issues
when migrating from Linux to OSX, and that this had proved to be a
show-stopper.

<a href="http://www.vim.org/">
<img class="center" src="http://i.imgur.com/glgoL5H.png" title="Vim Logo">
</a>

I have used Linux for many years now and was elated when Apple first
announced OSX, so naturally I have experienced several woes of
cross-platform madness. But, I had achieved a solid level of confidence
in my Vim configurations and it was one of the pieces that always worked
in a similar manner across those platforms. When I mentioned this to Jay
he invited me to add a few slides to his presentation about my
experiences with Vim and cross platform usages.

<a href="https://git-scm.com/">
<img class="center" src="http://i.imgur.com/PxeUBJN.png" title="git Logo">
</a>

Enter [git](https://git-scm.com/). Like many developers, I use my
version control systems constantly. Most frequently for me this is git,
and like others I use it to store configuration files. In the case
of Vim, I use it to store my `.vimrc` and `.vim` directory with all the
plugins and color schemes. This makes it really quick to setup new
accounts and shells. Let's walk through my normal flow when setting up
a new account:

```
$ cd ~
$ git clone https://github.com/elmiko/dotfiles.git .dotfiles
$ cd .dotfiles
$ ./install bash
$ ./install vim
```

So, what exactly is going on here? Well, I have created a
[small installer app](https://github.com/elmiko/dotfiles/blob/master/install)
with [Python](https://www.python.org/) that can take one of the
subdirectories in the repository and create a symbolic link to it from my
home. Considering that most configuration files on Linux involve a period
(`.`) somewhere in their paths, I have chosen to substitute an underscore
(`_`) in my files. I also have each application's configuration file in
a separate top level directory.

<img class="center" src="http://i.imgur.com/FSDboOz.png" title="OSX Vim">

When I tell the installer to `install vim`, it first looks for a `vim`
directory and then makes symbolic links from my home directory to the
files and directories in there, replacing underscores with periods. In
practice, this method has worked very well for me to keep my
configurations consistent across several platforms and distributions.

An added layer to this which I find to be especially helpful is creating
branches for different machines and environments that I use. I have
branches for my OSX machines, for my main Linux development shells, and
for server instances. By using the branches in combination with my bash
and tmux configurations, I have achieved a nice effect of having all my
servers setup with different colors for their prompt and screens. This
is great when I need to switch between a local shell running a test
version of [sahara](https://github.com/openstack/sahara), and my server
running a [devstack](https://github.com/openstack-dev/devstack) install.

<img class="center" src="http://i.imgur.com/4JLPy0n.png" title="Linux Vim">

In short, this method of storing various configurations for several
applications and platforms has greatly increased my efficiency when
provisioning new instances. And when working with technologies like
[OpenStack](https://www.openstack.org/) or
[OpenShift](https://www.openshift.com/), you often end up on a
strange shell somewhere in space and time without a towel. Being able
to quickly customize my shell, and tooling, makes these journeys much
more enjoyable.

<div class="alert alert-danger" role="alert">
If you use public version control systems, always ensure that
you have not left sensitive information in your configurations.
</div>

Now, I will add a small caveat to my specific case. My Vim
configurations are quite simple currently. I don't have much more than
NERDTree and a handful of color schemes and language syntax
highlighters. So, if you run something like [Eclim](http://eclim.org/)
, this may not be as easy. If you do use something as complex as Eclim,
and this technique works well, please let me know!.

Have fun, and happy hacking =)
