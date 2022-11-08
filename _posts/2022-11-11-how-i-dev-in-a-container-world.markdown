---
layout: post
title: "How I develop in a container world"
subtitle:  ""
date: 2022-11-11
categories:
---

I spend most of my days hacking on various bits of [Kubernetes](https://kubernetes.io)
and [OpenShift](https://openshift/com). Because OpenShift is Kubernetes at the
core, there are several pieces of code that are very similar. When making changes,
wanting to run tests, or building binaries, I usually need very specific
environments to keep all the bits happy. This becomes especially prominent as
I switch between branches of the same repository that must compile with
different versions of Go and related dependencies.

For the most part the Go language has done a good job of isolating a code
repository's dependencies through the use of [vendoring](https://go.dev/ref/mod#vendoring).
But Go is just one of the languages and environments that I work in regularly,
and as each language has its own dependency management and build systems, it
can become very complex to keep my host operating system up-to-date with all
the toolchains that I need.

This is where containers and the revolution that was ignited by [Docker](https://docker.com)
was supposed to come in and make life easier. And to a large extent they did, but
while there are many attractive features of using containers for
_developing all the things!_, and I do love the idea of having my tools for
each environment cataloged away in my image library, I loathe the notion of
typing this over and over:

```
$ podman run --rm -it -v $(pwd):/some/dir:Z some/image:latest make test build
```

Keeping track of all the images and various volume mounting commands I want
quickly gets tedious when working on more than a dozen repositories. Likewise,
I could make alias commands to help out, but I chose to do what many before me
have done: I wrote a small application to do exactly what I wanted.

So, what did I want?

<img src="/img/container-run-1.png" class="img-responsive center-block" alt="diagram of containers and directories">

Essentially, I _/really/_ want a terminal shell that is aware of what
directory I am in, and then changes container context based on some configuration.
With the ultimate goal that I could run something like `make build` in various
directories and just have it _"do the right thing"_.  After investigating this
idea for several weeks I couldn't quite find something that worked for me, so I
decided to create something.

## In steps container-run

The simplest approach that I could envision to solve my issue was to make a
command line application which would ingest a global configuration and then
run a container with the commands I passed. In practice this looks something
like:

```shell
~ $ cd kubernetes
~/kubernetes $ container-run make test
<output happens>
```

As such, [container-run](https://gitlab.com/elmiko/container-run) was born, and
as I started to use this tool more and more it started to make my life
tremendously easier. I suddenly freed myself from the shackles of my operating
system's installed packages, and likewise from typing the same commands over
and over (and making many mistakes along the way).

I have created a configuration file that looks like this (this happens to be
from a secondary devel machine I have):

```json
{
  "basenames": {
    "machine-api-operator": { "profile": "openshift-golang" },
    "cluster-api-provider-kubemark": { "profile": "sigs.k8s-golang" },
    "hyperbaric": { "profile": "sigs.k8s-golang" },
    "kind": {"profile": "sigs.k8s-golang"},
    "okd.io": {"profile": "okdio"},
    "okd-camgi": {"profile": "python-3.9"}
  },
  "defaults": {
      "image": "quay.io/fedora/fedora:latest",
      "mountpoint": "/opt/{basename}",
      "environment": {
      }
  },
  "profiles": {
      "okdio": {
          "image": "quay.io/centos7/ruby-27-centos7",
          "mountpoint": "/opt/app-root/src"
      },
    "openshift-golang": {
      "image": "docker.io/openshift/origin-release:golang-1.16",
      "mountpoint": "/go/src/github.com/openshift/{basename}"
    },
    "sigs.k8s-golang": {
      "image": "docker.io/library/golang:1.17",
      "mountpoint": "/go/src/sigs.k8s.io/{basename}"
    },
    "python-3.9": {
        "image": "registry.access.redhat.com/ubi8/python-39",
        "mountpoint": "/opt/app-root"
    }
  }
}
```

What this file does is match a basename to a profile for running a container.
Each profile allows me to specify the container image, the mountpoint inside
the container, and a set of environment variables that should be injected into
the running container. I even have a set of defaults that can be used in any
directory that does not have a profile.

In usage what I do is `cd` between the various projects I am working on, and
then execute build specific commands without the worry of having the
proper dependencies installed. Because of the mounting scheme I am also able
to generate files within the container and have them saved on the host filesystem.
You might notice the `{basename}` portions in the mountpoint entries, this will
substitutue the basename of the directory into the container mount allowing for
easy mapping to various directory structures which tools might dictate.

## Debugging the tool that takes over your command line

Because `container-run` consumes the rest of the command line and then
calls `exec` to start the container, it can be difficult to inject commands
that go directly to the `container-run` app to enable a verbose mode. I solved
this by adding an environment variable (`CONTAINER_RUN_VERBOSITY`) which can be
used to emit log messages and save to a log file. It looks like this:

```shell
[mike@gamebox] main ~/opt/kind
$ container-run make help
2022-11-10 20:06:38.624833927 [DEBUG] <container_run:63>:detected basename "kind"
2022-11-10 20:06:38.624876988 [DEBUG] <container_run::configuration:65>:configuration file "./.container-run.conf", not found
2022-11-10 20:06:38.624904140 [DEBUG] <container_run::configuration:62>:found configuration file "/home/mike/.container-run.conf"
2022-11-10 20:06:38.624972269 [DEBUG] <container_run::configuration:21>:profile = "sigs.k8s-golang"
2022-11-10 20:06:38.624988565 [DEBUG] <container_run::configuration:23>:image = "docker.io/library/golang:1.17"
2022-11-10 20:06:38.625005256 [DEBUG] <container_run::configuration:25>:mountpoint = "/go/src/sigs.k8s.io/kind"
2022-11-10 20:06:38.625019629 [DEBUG] <container_run::configuration:27>:engine = ""
2022-11-10 20:06:38.625041572 [DEBUG] <container_run:66>:config = Configuration { image: "docker.io/library/golang:1.17", mountpoint: "/go/src/sigs.k8s.io/kind", engine: "" }
2022-11-10 20:06:38.626711089 [DEBUG] <container_run:124>:detected container engine "podman"
2022-11-10 20:06:38.626735362 [DEBUG] <container_run:105>:assembled exec command "podman run --rm -it --volume=/home/mike/opt/kind:/go/src/sigs.k8s.io/kind:Z --workdir=/go/src/sigs.k8s.io/kind docker.io/library/golang:1.17 make help"
make: *** No rule to make target 'help'.  Stop.
```

This has been working well for me in practice, and I end up using this tool
several times a week, if not daily. There are a few things that I would like
to add if only to improve the user experience.

## The future and thoughts on small projects

Even though I am the main user for container-run, I stil have needs! and I can
be a terrible user. So I have been keeping the
[issues page for container-run](https://gitlab.com/elmiko/container-run/-/issues)
up-to-date with the things I think I want. I tend to try and update this page
whenever a bug happens or a thought occurs about what I think the project needs.
I even managed to get a colleague using the tool on his OSX machine and he
contributed a patch to fix an issue there. (thanks Denis!)

This brings me to my thoughts about working on small projects, or things
which only really improve your life (and maybe a few other people's lives). I
really love creating these bespoke tools, I also love just hacking on code in
general, but something that I've been trying to do more and more as I get older
is to fully engage on these little projects. What I mean by that is I create
issues, merge my changes from branches with proper pull requests, and maintain
docs and tests and the like. I don't do this out of some sort of mindless
obeisance to the software gods, but because it feels like an extension of my
_coding kata_ that I use to hone my skills.

One of the massive net side effects of being slightly pedantic and nerdy about
these projects is that it also helps others to get in on the fun. Another tool
that I created for an internal project ([camgi.rs](https://github.com/elmiko/camgi.rs)
for the curious) got a random drive by commit from a fellow Red Hatter simply
because they wanted to learn some Rust and I had a few issues which I had
recorded. They found the tool, found the issue, and resolved it on their own,
all because it was there for the taking, and I'm certainly happy that they did. (thanks Radek!)

I guess what I'm saying is that I love the open source culture and the practice
of making computing our own. Your project doesn't need to have thousands of stars
on GitHub to be of great value. Heck, I'll bet there are only 2 of us using
container-run, but it makes my life immeasurably easier. I also want to note
that in supporting this culture and ensuring that it continues to grow and evolve
I think it's important to practice the _chop wood, carry water_ aspects of software
development. Not only to help yourself, but also because it helps the next
generation of midnight hackers who are looking for that chance to get involved
in the bigger picture.

I said earlier that I didn't find any other projects that suited my exact needs,
and that is true. But, at the same time that I was creating container-run, my
friend Tristan de Cacqueray was busy hacking on [podenv](https://github.com/podenv/podenv)
which is a similar, albeit much more powerful, project. I applaud his efforts
and loved seeing what he was working on while we both developed similar tools.
(although I have to admit I am _slightly_ jealous of the GitHub stars XD)

I hope you are coding away on your project to make life easier, and as always
happy hacking =)
