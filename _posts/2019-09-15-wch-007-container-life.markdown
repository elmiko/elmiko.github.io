---
layout: post
title: "Weekend Code Hacker 007"
subtitle:  "Living the container life with Buildah and Podman"
date: 2019-09-15
categories:
---

I have been experimenting with changing my workflows while using Linux,
especially with respect to the current trends in immutable root filesystems
and extending functionality with containers. As I mainly use Fedora, I am
extremely interested in pushing my abilities with
[Silverblue](https://silverblue.fedoraproject.org/) and
[Fedora CoreOS](https://docs.fedoraproject.org/en-US/fedora-coreos/getting-started/).
To get the most of these distributions it will be essential that I have most
of my common development tools available as containers or as
[Flatpaks](https://flatpak.org/).

Today's tale is about how I am attempting capture one of my preferred tools,
[Yarn](https://yarnpkg.io), in a container and then make that container more
widely useful to myself. The key here is that I am **not** going to use the
commonly accepted practice of creating and building from Dockerfiles and
instead I will use what I learned from this
[Buildah tutorial](https://github.com/containers/buildah/blob/master/docs/tutorials/01-intro.md).

### Building my dream container

[Buildah](https://buildah.io) is a tool for building, working with, and storing
container images. I find its approach to modifying containers as you build them
to be very cool. While it can use Dockerfiles to build containers, all my
experimentation here is done using the Buildah commands and locally mounted
filesystems. The reason I am doing this, aside from the glory of adventure, is
to make my images smaller and more focused by only installing what I need.

So I set out making a normal shell script to do the container building for me.
One of the pains about using Yarn instead of the Node Package Manager is that
Fedora does not currently have a package for Yarn in its upstream repositories.
The kind folks of the Yarn community *have* created packages that can easily
be installed, but this requires adding a new repository to my root filesystem
(taking me further from a pristine environment). Wrapping this install inside
a container seemed like a natural fit, plus I
[could not find a flatpak for Yarn](https://flathub.org/apps/search/yarn) either.

This is the script I ended up with:

```bash
set -ex

trap_err() {
    buildah umount $container
    buildah rm $container
}

trap trap_err ERR

container=$(buildah from scratch)

scratchmnt=$(buildah mount $container)

dnf install -y --nogpgcheck --installroot $scratchmnt --repofrompath yarn,https://dl.yarnpkg.com/rpm/ --releasever 30 --setopt install_weak_deps=false yarn

buildah config --entrypoint '["/usr/bin/yarn", "--cwd", "/opt/app-root/src"]' $container

buildah umount $container
```

I'm not going to break down every line as I feel the
[buildah tutorial](https://github.com/containers/buildah/blob/master/docs/tutorials/01-intro.md)
does a great job. The main addition to my script is the error trap to make
sure that I clean up the container. This mainly is for my personal preference
because you will get a lot of containers in various states of install and I
find cleaning them up to be preferable.

Once I had created the container, I was able to save its contents and the
associated metadata using the `buildah commit` command. A little container
image wrangling later (I wanted to move the container out of the root user)
and I was testing the image with [Podman](https://podman.io). Podman is like
the sister tool to Buildah, it gives you a convenient interface for running
and managing container images. It also mimics the command structure of Docker,
so if you are familiar with that tool it will be easy.

### Next step, how do I make this useful?

Normally when I run `yarn` from the command line, it has several assumptions
about what is in the current directory. Furthermore, I can direct it to run
specific things (eg build or development scripts) by giving the command
arbitrary arguments. Even *furthermore* is the notion that I might need to
pass specific flags and arguments to `yarn` itself.

Naturally, the answer to this is to wrap the command in a script and
call it a day. And that is exactly what I did, ending up with this:

```bash
#!/bin/sh
podman run --rm -it -v $(pwd):/opt/app-root/src:Z quay.io/elmiko/yarn:latest $*
```

I named this file `yarn`, made it executable, and added it to my local path.
So far so good, my script will mount the current directory at a location that
the container entrypoint expects and it will pass any command line arguments
to the `yarn` command called in the container. This wrapper served me well
for a bit and I was able to continue building the development code I was
working on, but I quickly ran into another issue that led me to a deeper
thought about containerized tools.

[One](https://gitlab.com/elmiko/wire-hobo-console) of the projects that I was
hacking on while trying the Yarn container is a website that could serve
itself when run in development mode. This meant that it would attempt to run
an HTTP server and use a network port on the host. Because I am now running
Yarn inside a container, this means that I will need to use a special command
on Podman to expose that port. This isn't a problem, but it's something that
my wrapper script did not anticipate.

### New tools for the future?

I'm not sure if something like this exists already, but it quickly became
clear to me that what I really needed in my script was something akin to this:

```bash
#!/bin/sh
podman run $PODMAN_OPTS quay.io/elmiko/yarn:latest $IMAGE_OPTS
```

When called from the command line I will need the flexibility to send options
to `podman` as well as `yarn`. My current thinking is that some sort of prefix
might be what I want, like this:

```
$ yarn --podman="-v$(pwd):/opt/app-root/src:Z" yarn-command
```

In this example I am using `--podman` to send the volume mount flag to the
underlying Podman command, and `yarn-command` is simply a stand-in value. The
trouble with *this* is that I will now need some sort of glue to make the
`--podman` flag turn into something in the `yarn` script.

I'm not sure where this is all going, perhaps a tool already exists in this
space and I just haven't seen it yet, but I am starting to collect my
[buildahs](https://gitlab.com/elmiko/buildahs) in a repository. I'm even
enabling continuos integration builds using Buildah, and I know I will add
more tools in the future. I will soon need a solution to help coordinate the
abstraction between command names (eg `yarn`) and the underlying container
runtime commands that allows me the flexibility I have described here.

Maybe next time I'll talk a little bit about automating Buildah and Gitlab CI
to with Quay, that was another late weekend night.

as always, happy hacking =)
