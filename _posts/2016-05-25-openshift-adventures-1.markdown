---
layout: post
title:  "Adventures in OpenShift: getting my image installed"
date:   2016-05-25
categories:
---

Lately, I have been doing some work with OpenShift and exploring how it works
in addition to building some small applications. The first stages of this
for me have been installing OpenShift and working through the learning curve
of cluster administration.

For my first hurdle, I have been working towards uploading my application
container image into a freshly installed OpenShift. To do this I have had
to learn a little about how OpenShift controls access and also how it wants
to see images.

I have a small 3 node cluster running and it is installed as per a default
installations from the Red Hat openshift-ansible playbooks, with a little
tweaking to my inventory from my colleague
[Tim St. Clair](https://twitter.com/timothysc).

I started with a little setup, making sure I am logged in as the system
administrator, and in the default project, i then added some roles to
my user account:

```
root@192: /home/cloud-user # oc login -u system:admin
You have access to the following projects and can switch between them with 'oc project <projectname>':

  * default
  * elmiko (current)
  * management-infra
  * openshift
  * openshift-infra

  Using project "elmiko".
root@192: /home/cloud-user # oc project default
Now using project "default" on server "https://192.2.5.18:8443".
root@192: /home/cloud-user # oadm policy add-role-to-user system:image-builder elmiko
root@192: /home/cloud-user # oadm policy add-role-to-user admin elmiko -n openshift
```

this process is described in the OpenShift docs for
[Accessing the Registry Directly](https://docs.openshift.com/enterprise/latest/install_config/install/docker_registry.html#deploy-registry)

Next, I run the actual registry creation commands as per the docs on
[Deploying the Registry](https://docs.openshift.com/enterprise/latest/install_config/install/docker_registry.html#deploy-registry),
I differed a little from the docs in that I just chose to run the
`oadm registry` with default options. I also ran a few commands after creation
to inspect the process:

```
root@192: /home/cloud-user # oadm registry
serviceaccounts "registry" created
clusterrolebinding "registry-registry-role" created
deploymentconfig "docker-registry" created
service "docker-registry" created
root@192: /home/cloud-user # oc get svc
NAME              CLUSTER-IP       EXTERNAL-IP   PORT(S)                   AGE
docker-registry   172.24.151.163   <none>        5000/TCP                  8s
kubernetes        172.24.0.1       <none>        443/TCP,53/UDP,53/TCP     6d
router            172.24.68.146    <none>        80/TCP,443/TCP,1936/TCP   6d
root@192: /home/cloud-user # oc get pods
NAME                       READY     STATUS    RESTARTS   AGE
docker-registry-1-4jhm6    0/1       Running   0          5s
docker-registry-1-deploy   1/1       Running   0          11s
router-1-rrjmx             1/1       Running   0          6d
root@192: /home/cloud-user # oc get pods
NAME                      READY     STATUS    RESTARTS   AGE
docker-registry-1-4jhm6   1/1       Running   0          14s
router-1-rrjmx            1/1       Running   0          6d
root@192: /home/cloud-user # oc describe pod docker-registry-1-4jhm6
Name:           docker-registry-1-4jhm6
Namespace:      default
Node:           192.2.5.19/192.2.5.19
Start Time:     Wed, 25 May 2016 15:34:48 -0400
Labels:         deployment=docker-registry-1,deploymentconfig=docker-registry,docker-registry=default
Status:         Running
IP:             172.20.0.2
Controllers:    ReplicationController/docker-registry-1
Containers:
  registry:
    Container ID:       docker://ee4a27846a7c0b7f37fa185672428e3624d89d5ad4be8031c93000644827e03d
    Image:              openshift3/ose-docker-registry:v3.2.0.44
    Image ID:           docker://b7a3023c9861d9a5acb69dc94260e276f20c78f96fa1c6848496fb7df06cb275
    Port:               5000/TCP
    QoS Tier:
      cpu:              BestEffort
      memory:           BestEffort
    State:              Running
      Started:          Wed, 25 May 2016 15:34:51 -0400
    Ready:              True
    Restart Count:      0
    Liveness:           http-get http://:5000/healthz delay=10s timeout=5s period=10s #success=1 #failure=3
    Readiness:          http-get http://:5000/healthz delay=0s timeout=5s period=10s #success=1 #failure=3
    Environment Variables:
      REGISTRY_HTTP_ADDR:       :5000
      REGISTRY_HTTP_NET:        tcp
      REGISTRY_HTTP_SECRET:     2NEiDI4MlmyABzAhSVlxkQfHcO8eGOR2VNV8hRMRuHk=
Conditions:
  Type          Status
  Ready         True
Volumes:
  registry-storage:
    Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
  registry-token-lyrzq:
    Type:       Secret (a volume populated by a Secret)
    SecretName: registry-token-lyrzq
Events:
  FirstSeen     LastSeen        Count   From                    SubobjectPath                   Type            Reason          Message
  ---------     --------        -----   ----                    -------------                   --------        ------          -------
  37s           37s             1       {default-scheduler }                                    Normal          Scheduled       Successfully assigned docker-registry-1-4jhm6 to 192.2.5.19
  36s           36s             1       {kubelet 192.2.5.19}    spec.containers{registry}       Normal          Pulled          Container image "openshift3/ose-docker-registry:v3.2.0.44" already p
  resent on machine
  35s           35s             1       {kubelet 192.2.5.19}    spec.containers{registry}       Normal          Created         Created container with docker id ee4a27846a7c
  34s           34s             1       {kubelet 192.2.5.19}    spec.containers{registry}       Normal          Started         Started container with docker id ee4a27846a7c


```

That is a little verbose, but I wanted to look at the pods being created and
see what is going on. After I run the `oadm registry` command, you can see
the deployment pod in action before it disappears.

Ok, so at this point we have a registry setup and my user should be able to
push images to it, so let's build the image into the local docker registry:

```
root@192: /home/cloud-user/elmiko-rest # docker build -t elmiko-rest-server .
Sending build context to Docker daemon 12.87 MB
Step 1 : FROM golang
Trying to pull repository registry.qe.openshift.com/golang ... not found
Trying to pull repository registry.access.redhat.com/golang ... not found
Trying to pull repository docker.io/library/golang ... latest: Pulling from library/golang
3059b4820522: Pull complete 
ff978d850939: Pull complete 
4e59e6df754e: Pull complete 
e1726eb448bb: Pull complete 
9ab86e9ff843: Pull complete 
05f2aaa5d28b: Pull complete 
c949ca4b54d6: Pull complete 
14f0bac97db6: Pull complete 
e8f176a896c5: Pull complete 
481b2a0c1a59: Pull complete 
00134c01692a: Pull complete 
0de49527cc3b: Pull complete 
51fee56f81db: Pull complete 
cbd0d2ba1c9b: Pull complete 
Digest: sha256:ac856e0e50b686552d62249dfd98cb449ab8e38e5a167dd444194ae1e59d924c
Status: Downloaded newer image for docker.io/golang:latest

 ---> cbd0d2ba1c9b
Step 2 : ADD . /go/src/github.com/elmiko/elmiko-rest
 ---> c60f0f96a548
Removing intermediate container deba1c12c0ef
Step 3 : RUN go get github.com/tools/godep
 ---> Running in 3e8886df4fe2
 ---> 2e4eac0afd8d
Removing intermediate container 3e8886df4fe2
Step 4 : WORKDIR /go/src/github.com/elmiko/elmiko-rest
 ---> Running in 5bd2d8755385
 ---> e91fe3dc07d1
Removing intermediate container 5bd2d8755385
Step 5 : RUN make install
 ---> Running in 678762a941ae
tools/build.sh install
+ git describe --tags --abbrev=0
+ head -n1
+ TAG=
+ [ -z ]
+ TAG=0.0.0
+ APP=elmiko-rest-server
+ [ install = build ]
+ export GO15VENDOREXPERIMENT=1
+ godep go install -ldflags -X github.com/elmiko/elmiko-rest/version.gitTag=0.0.0 -X github.com/elmiko/elmiko-rest/version.appName=elmiko-rest-server ./cmd/elmiko-rest-server
 ---> 27c639bb6686
Removing intermediate container 678762a941ae
Step 6 : ENTRYPOINT /go/bin/elmiko-rest-server --host 0.0.0.0 --port 8080
 ---> Running in c2ef5c5f4361
 ---> e10e44d1acdf
Removing intermediate container c2ef5c5f4361
Step 7 : EXPOSE 8080
 ---> Running in 02db3ee59cb9
 ---> a78e363ea00c
Removing intermediate container 02db3ee59cb9
Successfully built a78e363ea00c
root@192: /home/cloud-user/elmiko-rest # docker images | grep elmiko-rest-server
elmiko-rest-server                                              latest              a78e363ea00c        20 seconds ago      791.8 MB
```

Great! So now my image has been built and loaded into the local docker. I
will now move on to tagging it and then pushing it to my OpenShift internal
registry, as described in the
[Logging in to the Registry](https://docs.openshift.com/enterprise/latest/install_config/install/docker_registry.html#access-logging-in-to-the-registry)
and
[Pushing and Pulling Images](https://docs.openshift.com/enterprise/latest/install_config/install/docker_registry.html#access-pushing-and-pulling-images)
sections of the docs:

```
root@192: /home/cloud-user/elmiko-rest # oc get svc
NAME              CLUSTER-IP       EXTERNAL-IP   PORT(S)                   AGE
docker-registry   172.24.151.163   <none>        5000/TCP                  1m
kubernetes        172.24.0.1       <none>        443/TCP,53/UDP,53/TCP     6d
router            172.24.68.146    <none>        80/TCP,443/TCP,1936/TCP   6d
root@192: /home/cloud-user/elmiko-rest # oc login -u elmiko
You have access to the following projects and can switch between them with 'oc project <projectname>':

  * elmiko (current)
  * openshift

Using project "elmiko".
root@192: /home/cloud-user/elmiko-rest # oc whoami -t
3gIbEM_3F1SHknYz8F07bqErETZdsvPzin5GvbDtgGY
root@192: /home/cloud-user/elmiko-rest # docker login -u elmiko -e foo@bar.baz -p 3gIbEM_3F1SHknYz8F07bqErETZdsvPzin5GvbDtgGY 172.24.151.163:5000
WARNING: login credentials saved in /root/.docker/config.json
Login Succeeded
root@192: /home/cloud-user/elmiko-rest # docker tag elmiko-rest-server 172.24.151.163:5000/elmiko/elmiko-rest-server
root@192: /home/cloud-user/elmiko-rest # docker images | grep elmiko-rest-server
elmiko-rest-server                                              latest              a78e363ea00c        23 minutes ago      791.8 MB
172.24.151.163:5000/elmiko/elmiko-rest-server                   latest              a78e363ea00c        23 minutes ago      791.8 MB
root@192: /home/cloud-user/elmiko-rest # docker push 172.24.151.163:5000/elmiko/elmiko-rest-server
The push refers to a repository [172.24.151.163:5000/elmiko/elmiko-rest-server] (len: 1)
a78e363ea00c: Pushed 
e10e44d1acdf: Pushed 
27c639bb6686: Pushed 
e91fe3dc07d1: Pushed 
2e4eac0afd8d: Pushed 
c60f0f96a548: Pushed 
cbd0d2ba1c9b: Pushed 
0de49527cc3b: Pushed 
e8f176a896c5: Pushed 
9ab86e9ff843: Pushed 
e1726eb448bb: Pushed 
4e59e6df754e: Pushed 
3059b4820522: Pushed 
latest: digest: sha256:9a25f8883cad2770a93e129786216eedab2a3d9671749de4eb76fbb3d226bf87 size: 37923
```

Just a quick breakdown of what I have done here, first I check to see the
services so that I know the IP address of the registry. Then I login as
my user `elmiko` and also login to the docker registry. Finally I tag the
image, check to see that it is in docker, then push the image to the internal
registry.

And with all this done, my image is now appearing in the ImageStreams for
my project in OpenShift:

```
root@192: /home/cloud-user/elmiko-rest # oc get is
NAME                  DOCKER REPO                                      TAGS      UPDATED
elmiko-rest-server   172.24.151.163:5000/elmiko/elmiko-rest-server   latest    About an hour ago
```

Next time I'll actually use this image for something, but for now it's time
sit back and enjoy some music =)
