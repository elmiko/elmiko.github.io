---
layout: post
title: "Diving Deeper into Cluster API Testing"
subtitle:  ""
date: 2023-02-28
categories:
---

Recently I had the opportunity to spend some time reviewing and deep diving
into the [Cluster API][capi] end-to-end test suite with the guidance of
[Fabrizio Pandini][fabrizio]. He has been crafting a change to the
[Kubemark provider][kubemark] that will integrate the
[Cluster API E2E test framework][capie2e] so that we can more easily
develop tests that utilize the Kind + Cluster API + Kubemark configurations
that I have [mentioned][notes1] a [few times][notes2] in the past. We paired
up so that I could better understand the test framework and to talk about
debugging the pull request.

The integration patch can be seen here: [kubernetes-sigs/cluster-api-provider-kubemark#69][pr],
and Farbizio was also kind enough to let me record our deep dive so that we could share it
with the wider community:

<div style="margin: 1em;">
<iframe class="center-block" width="640" height="480" src="https://www.youtube-nocookie.com/embed/KU7i4TfD1tg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

All the code that was shown in the video is available in the pull request linked above,
the [cluster-api-provider-kubemark][kubemark] repository, and the [cluster-api][capirepo]
repository.

If you are curious about the Tilt configuration we talk about, please see the
[Developing Cluster API with Tilt][capitilt] page of the documentation. And if you have
been following my [Cluster API Kubemark Ansible][cak] efforts that I mentioned in the
[previous post][notes2], I have also added a new playbook for installing the Tilt server
as well.

One of the things I love about open source software and the culture that has evolved with it
are the people and the communities behind the monitors. I want to give my special thanks and
gratitude to Fabrizio for being a great mentor and collaborator, and to the rest of the Cluster
API community for being awesome in general and for creating a warm and welcoming place to
share a passion for technology.

as always, happy hacking =)

[capi]: https://cluster-api.sigs.k8s.io
[capirepo]: https://github.com/kubernetes-sigs/cluster-api
[capie2e]: https://cluster-api.sigs.k8s.io/developer/e2e.html
[capitilt]: https://cluster-api.sigs.k8s.io/developer/tilt.html
[kubemark]: https://github.com/kubernetes-sigs/cluster-api-provider-kubemark
[fabrizio]: https://github.com/fabriziopandini
[notes1]: https://notes.elmiko.dev/2021/10/11/setup-dev-capi-kubemark.html
[notes2]: https://notes.elmiko.dev/2023/01/21/automating-my-hollow-kubernetes-test-rig.html
[pr]: https://github.com/kubernetes-sigs/cluster-api-provider-kubemark/pull/69
[cak]: https://github.com/elmiko/cluster-api-kubemark-ansible


