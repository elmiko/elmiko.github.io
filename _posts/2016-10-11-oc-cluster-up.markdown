---
layout: post
title:  "`oc cluster up` is my new OpenShift bff"
date:   2016-10-11
categories:
---

Developing cloud native applications for OpenShift has been a really fun
experience for me so far. But in the early days I had a great deal of trouble
landing on a developer toolchain that worked for my habits. We had an internal
cluster that I could develop on, but this proved troublesome when I wanted
to mess around with the host systems, or nuke the whole thing and start over.
This lead me to deploying my own infrastructure on hardware that I could
control locally. I think we all know that this path often leads to madness.

Enter `oc cluster up`. I'm not sure exactly when this command was added to the
OpenShift toolkit, but it has improved my life **significantly**. I want to
give a big shoutout to all the OpenShift contributors, thank you =)

Before we get started, I need to mention one thing. This is **NOT**
recommended for anything approaching a production environment. This is purely
for development, testing, and other isolated types of usages. Furthermore, I
recommend running this type of setup in a virtual machine, or on a piece of
hardware that aren't using for anything else. My reasoning for this is that
the cluster command will install a bunch of things to your local docker
registry and you may wish to avoid all that spam on a non-development machine.
You have been warned.

So, what does this do exactly. The `oc` command will be familiar to anyone who
uses OpenShift from the command line, but for those who haven't tried it yet
I will quote from their help text:

```
OpenShift Client

This client helps you develop, build, deploy, and run your applications on any OpenShift or
Kubernetes compatible platform. It also includes the administrative commands for managing a
cluster under the 'adm' subcommand.
```

For the most part, the client command is your main access point to doing just
about anything with OpenShift. In this post though, I am going to hone in on
just the cluster functionality. At the risk of too much copy-pasta I will
quote from the cluster help text:

```
Manage a local OpenShift cluster.

The OpenShift cluster will run as an all-in-one container on a Docker host. The Docker host
may be a local VM (ie. using docker-machine on OS X and Windows clients), remote machine, or
the local Unix host.
```

This is pretty huge as far as I'm concerned, it allows you to deploy an
OpenShift platform for testing in a single command. Here's a sample of what it
looks like in action:

```
$ oc cluster up
-- Checking OpenShift client ... OK
-- Checking Docker client ... OK
-- Checking Docker version ... OK
-- Checking for existing OpenShift container ... OK
-- Checking for openshift/origin:v1.4.0-alpha.0 image ... OK
-- Checking Docker daemon configuration ... OK
-- Checking for available ports ... 
   WARNING: Binding DNS on port 8053 instead of 53, which may be not be resolvable from all clients.
-- Checking type of volume mount ... 
   Using nsenter mounter for OpenShift volumes
-- Creating host directories ... OK
-- Finding server IP ... 
   Using 10.0.1.109 as the server IP
-- Starting OpenShift container ... 
   Creating initial OpenShift configuration
   Starting OpenShift using container 'origin'
   Waiting for API server to start listening
   OpenShift server started
-- Adding default OAuthClient redirect URIs ... OK
-- Installing registry ... OK
-- Installing router ... OK
-- Importing image streams ... OK
-- Importing templates ... OK
-- Login to server ... OK
-- Creating initial project "myproject" ... OK
-- Removing temporary directory ... OK
-- Server Information ... 
   OpenShift server started.
   The server is accessible via web console at:
       https://10.0.1.109:8443

   You are logged in as:
       User:     developer
       Password: developer

   To login as administrator:
       oc login -u system:admin
```

What all did that do?

Well, it downloaded the necessary containers to run OpenShift at version
1.4.0-alpha.0, then deployed an entire cluster as containers on my local
machine. It has also started the OpenShift web console on the address
specified (`https://10.0.1.109:8443` in my case), created a user named
`developer`, and given that user an initial project `myproject`. The best way
to see the output of this is to look at the results in docker registry and
currently running docker processes.

```
$ docker images
REPOSITORY                                          TAG                 IMAGE ID            CREATED             SIZE
docker.io/radanalyticsio/oshinko-rest               latest              9aa935891f57        12 days ago         1.023 GB
docker.io/openshift/origin-sti-builder              v1.4.0-alpha.0      70676b107f39        3 weeks ago         537 MB
docker.io/openshift/origin-deployer                 v1.4.0-alpha.0      a5f428ddd52f        3 weeks ago         537 MB
docker.io/openshift/origin-docker-registry          v1.4.0-alpha.0      503c75e81213        3 weeks ago         373.7 MB
docker.io/openshift/origin-haproxy-router           v1.4.0-alpha.0      24e99f840192        3 weeks ago         556.1 MB
docker.io/openshift/origin                          v1.4.0-alpha.0      473afd89702c        3 weeks ago         537 MB
docker.io/openshift/origin-pod                      v1.4.0-alpha.0      c6b1baf76ef2        3 weeks ago         1.591 MB
```

This is a trimmed list, to protect the innocent ;) , but you can see the
images that were downloaded when I first ran this install (three weeks ago).

```
$ docker ps
CONTAINER ID        IMAGE                                             COMMAND                  CREATED             STATUS              PORTS                    NAMES
afb3d2d4e90b        openshift/origin-docker-registry:v1.4.0-alpha.0   "/bin/sh -c 'DOCKER_R"   6 minutes ago       Up 6 minutes                                 k8s_registry.e2da05af_docker-registry-1-dwayc_default_7a414a92-8fe8-11e6-97f8-3c970ee9262a_3225f27a
2d6a393fa773        openshift/origin-haproxy-router:v1.4.0-alpha.0    "/usr/bin/openshift-r"   6 minutes ago       Up 6 minutes                                 k8s_router.98456a0a_router-1-8q723_default_79c40f49-8fe8-11e6-97f8-3c970ee9262a_7796d67c
dd0461b2c544        openshift/origin-pod:v1.4.0-alpha.0               "/pod"                   6 minutes ago       Up 6 minutes                                 k8s_POD.dfb40123_docker-registry-1-dwayc_default_7a414a92-8fe8-11e6-97f8-3c970ee9262a_51ceb243
d6d2e5f48221        openshift/origin-pod:v1.4.0-alpha.0               "/pod"                   6 minutes ago       Up 6 minutes                                 k8s_POD.8c0fdf31_router-1-8q723_default_79c40f49-8fe8-11e6-97f8-3c970ee9262a_f89ee8ac
d79d6932525d        openshift/origin:v1.4.0-alpha.0                   "/usr/bin/openshift s"   7 minutes ago       Up 7 minutes                                 origin
```

And here are all the services running in our new OpenShift cluster.

I think it's worth noting at this point that I am running my `oc` from a
version of [OpenShift Origin](https://github.com/openshift/origin) that I
cloned and built locally, which is why I have the `v1.4.0-alpha.0` tag. The
really nice thing about this approach is that if I clone origin, and then
checkout a specific tag (for example 1.3.0) the resultant `oc cluster up` will
install that version. Very nice for testing.

Now, I have this development setup running on a laptop that i keep on a shelf.
It is by no means beefy, i7-4800MQ CPU @ 2.70GHz with 16GB ram, but it can
run enough of a cluster for me to spawn multiple pods and even deploy Apache
Spark clusters, which more than meets my needs.

As a final parting note, I've setup a
[minimal nodejs echo server](https://github.com/elmiko/echo-golem) that can be
built and deployed from the command line for OpenShift using the
source-to-image builders. With my new test cluster running I can easily deploy
my application with a single command:

```
$ oc new-app centos/nodejs-4-centos7~https://github.com/elmiko/echo-golem.git
--> Found Docker image dd6a62c (39 hours old) from Docker Hub for "centos/nodejs-4-centos7"

    Node.js 4 
    --------- 
    Platform for building and running Node.js 4 applications

    Tags: builder, nodejs, nodejs4

    * An image stream will be created as "nodejs-4-centos7:latest" that will track the source image
    * A source build using source code from https://github.com/elmiko/echo-golem.git will be created
      * The resulting image will be pushed to image stream "echo-golem:latest"
      * Every time "nodejs-4-centos7:latest" changes a new build will be triggered
    * This image will be deployed in deployment config "echo-golem"
    * Port 8080/tcp will be load balanced by service "echo-golem"
      * Other containers can access this service through the hostname "echo-golem"

--> Creating resources ...
    imagestream "nodejs-4-centos7" created
    imagestream "echo-golem" created
    buildconfig "echo-golem" created
    deploymentconfig "echo-golem" created
    service "echo-golem" created
--> Success
    Build scheduled, use 'oc logs -f bc/echo-golem' to track its progress.
    Run 'oc status' to view your app.
```

Ok, it's been scheduled to be built and deployed, let's follow its advice
and look for the new application's status:

```
$ oc status
In project My Project (myproject) on server https://10.0.1.109:8443

svc/echo-golem - 172.30.123.161:8080
  dc/echo-golem deploys istag/echo-golem:latest <-
    bc/echo-golem source builds https://github.com/elmiko/echo-golem.git on istag/nodejs-4-centos7:latest 
      build #1 running for 9 seconds
    deployment #1 waiting on image or update

1 warning identified, use 'oc status -v' to see details.
```

Great, so it says our app is built and running. Since this is a simple echo
server, let's see if I can get it to respond:

```
$ http 172.30.123.161:8080 foo=bar
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 14
Content-Type: text/html; charset=utf-8
Date: Tue, 11 Oct 2016 19:43:50 GMT
ETag: W/"e-lCMsW4/JJy9vc6HjbraPzw"
X-Powered-By: Express

{
        "foo": "bar"
}
```

Sweet! We are in business =)

I hope this has shown how simple it can be to get a development environment
up and running for OpenShift. I know it has changed how I develop applications
for this platform and it has greatily simplified my early work before I go
through the process of uploading to a "real" production cluster.
