---
layout: post
title:  "Cloud native is a tremendous polyglot playground"
date: 2018-01-06
categories:
---

I've been a lifelong student of computers and technology, and I have nearly
always found great satisfaction in learning new methodologies and conquering
code challenges. So it should be no surprise that I am still keenly interested
in improving my abilities and utilizing different software development
techniques.

In that vein, I feel quite lucky and am extremely grateful to have been exposed
to some great technology in the last several years of my career. One of those
pieces is the platform ideology that people are calling *cloud native*.
What this means from a technology perspective is primarily distributed container
orchestration, but on a more philosophical level I feel it also speaks to
notions of a development style akin to a Unix philosophy of yore: _"make
each program do one thing well"_. If you want to read more about cloud native
and what it means, check out the
[Cloud Native Computing Foundation's FAQ](https://cncf.io/about/faq/).

My main intention today though was not to talk at length about cloud native
philosophies and styles of software engineering, but to dive into something
that I'm noticing as a wonderful side-effect of working in and around the
cloud native world. Namely that these platforms are a tremendous playground
for polyglot developers.

So, guilty admission, I love starting new projects in languages that I have
never practiced before. Notice I said _"starting"_. I will freely admit that
there are way too many scraps of code laying around my sundry storage devices;
scraps which will most likely never see the light of deployment. But, I don't
let this discourage me. Sure in the past I saw this as a failing, but I've
learned to live with it and be happy with the journey.

<img src="/img/language-buffet.svg" class="img-responsive">

When I start playing with a new language, I usually want to write a
[Hello World](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program)
and then start looking for
[windmills](https://en.wikipedia.org/wiki/Tilting_at_windmills) . Setting up
that initial project
environment and learning the best practice idioms will often occupy many of
my early learning hours. One thing that I've found to be a powerful change to
my process has been to accept the container methodology that has seen a surge
in popularity over the last few years.

Now, I realize I'm not really saying anything earth-shattering here but I
think it's worth repeating that there are a few key ways that containers can
be a game changing tool for polyglot explorers.

1. **Standing on the shoulders of giants.** There are some wonderful language
  containers that have been created by really smart people to help you get an
  application running quickly. For example, check out this cool
  [Python Docker image](https://hub.docker.com/_/python/) that will handle
  installing dependencies and allows you to run an application without ever
  needing to install Python on your host.

1. **Not wrestling with configuration monsters.** This one may not be a big
  deal for some people, but in my experiences it can be really difficult to
  share a project with your peers if the install process is complicated. For
  example, I've been doing a bunch of work on the
  [radanalytics.io project web site](https://github.com/radanalyticsio/radanalyticsio.github.io)
  and it can be complicated to deploy locally depending on your host O/S. By
  adding a Docker manifest file to the repository it has become very simple
  for anyone to test and run the site locally using that container, this
  really helped us add more contributors to the site.

1. **Abstract away the infrastructure.** This is where we really start to hit
  the intersection between polyglot container life and the cloud native way.
  With platforms like [Kubernetes](https://kubernetes.io), 
  [Mesos](https://mesos.apache.org/) and other container-based orchestration
  engines you start to have a deeper reach into the online deployment world.
  For example, I run a few [django project](https://www.djangoproject.com/)
  based websites. These sites exist on platforms that have traditional
  shell accounts running on virtual machines. To deploy my sites I've needed
  to learn about the
  [Web Server Gateway Interface (WSGI)](https://en.wikipedia.org/wiki/Web_Server_Gateway_Interface)
  protocol _and_ my hosting provider's specific implementation of it to make
  my applications run. On a cloud native platform like
  [OpenShift](https://www.openshift.org) all I would need to do is tell it
  how to make my container images and where to expose their ports and like
  magic I would have an application running on a remote machine with a fully
  qualified domain name.

For me these are some of the really strong capabilities that I've come enjoy
when working in this environment.

### Enter my creation, the [Echo Golem!](https://gitlab.com/elmiko/echo-golem)

<a href="https://gitlab.com/elmiko/echo-golem">
<img alt="echo golem logo" src="/img/echo-golem-funny.png" class="img-responsive center">
</a>

Like I said before, I really enjoy starting new projects and I had a fun
experience recently that I've turned into a little challenge for myself. The
echo golem is my personal "Hello World" of the cloud native universe.

This application is an HTTP server that will echo back any body data sent to
it at the root path (`/`). It logs incoming requests and is configured to
listen for traffic on the `8080` port with no configurable options. My
challenge to myself is to use this project as a starting point for exploring
new languages in cloud native environments. Given the basic functionality of
the golem, I find that it really fits well for a simple straightforward
application that will get me a base level of necessary skills in a language.

One final note, there is a project maintained by the OpenShift team that
I absolutely love for this effort named
[source-to-image](https://github.com/openshift/source-to-image). With this
project you can quickly convert a source repository into a container image
with an automated entry point for an application. They have several language
patterns already configured and instructions on how to implement custom
builders. I highly recommend checking this out if you are going to be
experimenting with these types of applications.

As always, happy hacking!
