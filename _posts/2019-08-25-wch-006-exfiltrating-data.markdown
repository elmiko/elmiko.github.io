---
layout: post
title: "Weekend Code Hacker 006"
subtitle:  "Exfiltrating data from the cloud, a containerized approach"
date: 2019-08-25
categories:
---

One of the workflow patterns that I commonly see from my colleagues who are
using [Kubernetes](https://kubernetes.io) for data science and analytics work
is using [Jupyter](https://jupyter.org/) notebooks to explore data. I was
setting up another instance of Jupyter recently and it really got me thinking
about how people interact with the cloud when they want to save the work they
are doing.

I think the most common answer is for users to rely on the various
[Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) mechanisms
that exist across the Kubernetes world. But this has certain limitations
from a user perspective:

* the Kubernetes instance you are using needs to have a volume configured and
  ready to use
* you will need a method to get data out of the volume if you want to persist
  it in a more controlled environment
* on platforms that have RBAC you need to have access to create and manage
  volumes in your namespace

and those are just the ones that _I'm_ concerned about ;)

While the volume mechanics that exist in Kubernetes are excellent, I wanted
to explore how a user might save their work without engaging the volume
mechanisms, and that led me to create the
[mirrorshade-sidecar](https://gitlab.com/elmiko/mirrorshade-sidecar).

The mirrorshade-sidecar is a container that can be attached to other
containers so that data can be pushed out of the cloud environment. The
following diagram shows a high level architecture using the Git backend:

<img src="/img/mirrorshade.svg" class="img-responsive center-block" alt="mirrorshade architecture">

Basically what is happening is that I login to the Jupyter notebook and do my
work, in the background the directory containing the notebooks is shared with
the mirrorshade-sidecar container. Mirrorshade clones a repository that I
specify through a secret and then populates the notebook directory with those
files. As I do work and make changes to the files in the directory, the
sidecar catches the changes through the [inotify](https://linux.die.net/man/7/inotify)
API and updates the repository as necessary.

It took me awhile to get the Git mechanics working properly as I am using
[OpenShift](https://www.okd.io) as my default Kubernetes and there are several
security concerns I had to take into account. Most of these were around
getting the proper file permissions on the ssh key file. When I was building
the sidecar I mainly tested locally using [Podman](https://podman.io) _(you
can see my test scripts in the `hack` directory of the repo)_ which made it
easy to run the container but it also masked some of the uid/gid and permission
errors that I got in the cloud.

I'm trying to stay forward looking with respect to adding more functionality in
mirrorshade, it's got a pluggable backend API and I would like to add S3 support
as the next step. I'm sure there are plenty of bugs to work out as well, but I
will need to run across them as I use this more.

Overall, I think this is an interesting approach to saving your work while
running applications in the cloud. I could see using mirrorshade with online
editors and similar applications. I think there are probably a ton of
optimizations that could be done about when to save, what type of inotify
events are worthy of checkpointing, and how the user can customize the
metadata. It will also be interesting to see what other types of backend
interfaces might make sense.

Finally, here is a short video demonstration of me using the sidecar with
Jupyter on OpenShift. You can see the resulting saved repository at
[https://gitlab.com/mirrorshade-bot/test1](https://gitlab.com/mirrorshade-bot/test1).

as always, happy hacking o/

<iframe src="https://player.vimeo.com/video/355855482" class="center-block" width="640" height="357" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

