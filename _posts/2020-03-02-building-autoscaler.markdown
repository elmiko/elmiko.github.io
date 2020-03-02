---
layout: post
title: "Building the Kubernetes autoscaler on Fedora"
subtitle:  ""
date: 2020-03-02
categories:
---

Well... it's been a minute since I wrote anything here. Sometimes life gets
busy ;)

Much of my time recently has been spent learning about the Kubernetes
[Cluster API project](https://github.com/kubernetes-sigs/cluster-api). I have
recently changed roles within Red Hat and I am now spenting much more time on
the core layers of Kubernetes and less time on machine learning related
activities.

To get started on the project, I needed to start building the main components
and one in specific that I want to become proficient with is the Kubernetes
[autoscaler project](https://github.com/kubernetes/autoscaler). I run
[Fedora Linux](https://fedoraproject.org) as my primary desktop operating system
and the autoscaler requires the Go language tooling, _easy enough_ or so I thought...

The main autoscaler instructions about
[Getting the Code](https://github.com/kubernetes/autoscaler#getting-the-code)
are pretty clear and in no time I was able to get `make build` working. But
I had seen a colleague running individual tests out of the source tree using
the Go tooling directly and I _needed_ to know how to do this!

I switch to the feature branch I want and descend into the
`cloudprovider/openshiftmachineapi` directory to run the tests.

```bash
$ go test
go: k8s.io/api@v0.0.0: parsing /tmp/ca-update-vendor.8g82/kubernetes/staging/src/k8s.io/api/go.mod: open /tmp/ca-update-vendor.8g82/kubernetes/staging/src/k8s.io/api/go.mod: no such file or directory
```

hmm... that error looks kinda weird. What is happening that is causing Go to
look in `/tmp` for stuff? I check the `go.mod` file and do see something about a
bunch of Kubernetes modules that should be in `/tmp`. This is confusing.

After searching through several `Makefiles`, double checking my sanity, and
reading the script files in the `hack` directory of the repository I finally
start to see what is going on with the temporary directory. There is a script
file named `update-vendor.sh` in the `cluster-autoscaler/hack` directory that
has several commands about processing the Kubernetes module dependencies and
then creating a vendor directory in `/tmp`. Ok, this is making some sense but
how do I run the Go tools!

I talked with the colleague who had initially shown me this code and we
compared notes about development environments. It turns out that the ultimate
solution to my woes is uising the `-mod=vendor` command when running the tests.
And in fact, with this in place I can now run these commands:

```bash
$ go test -mod=vendor
W0302 15:21:19.296483  504379 machineapi_controller.go:359] Machine "test-namespace-machineset-0-machine-0" has no providerID
W0302 15:21:19.296542  504379 machineapi_controller.go:359] Machine "test-namespace-machineset-0-machine-1" has no providerID
W0302 15:21:19.296551  504379 machineapi_controller.go:359] Machine "test-namespace-machineset-0-machine-2" has no providerID
W0302 15:21:19.497661  504379 machineapi_controller.go:359] Machine "test-namespace-machineset-0-machine-1" has no providerID
W0302 15:21:19.497709  504379 machineapi_controller.go:359] Machine "test-namespace-machineset-0-machine-2" has no providerID
W0302 15:21:19.497727  504379 machineapi_controller.go:359] Machine "test-namespace-machineset-0-machine-0" has no providerID
PASS
ok      k8s.io/autoscaler/cluster-autoscaler/cloudprovider/openshiftmachineapi  11.667s
```

yay! I can start working on this thing =)

According to the documentation,

> The -mod build flag provides additional control over updating and use of go.mod.

and further,

> If invoked with -mod=vendor, the go command assumes that the vendor
> directory holds the correct copies of dependencies and ignores
> the dependency descriptions in go.mod.

what I gather this to mean is that all the fancy vendoring of Kubernetes that
is done must be handled automatically by flags in the Makefiles when building
and testing. I suppose the vendoring that is happening is actually using some
sort of staged or fixed version of Kubernetes that the module tooling has
issues with. Regardless, this flag allows me to easily continue on my journey.

If I wanted to go further I could set this flag in my `.bashrc` with
`export GOFLAGS="-mod=vendor"`, but I'm not sure if there are unintended
consequences to that action. I'm happy to have this stuff working, and perhaps
next time I will cover how to run it against a cluster.

take care, and happy hacking!
