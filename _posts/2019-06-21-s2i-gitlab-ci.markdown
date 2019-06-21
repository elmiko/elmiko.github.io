---
layout: post
title:  "Using source-to-image builds from GitLab CI"
date: 2019-06-21
categories:
---

In the course of doing some automation upgrade to
[stasis-reactor](https://gitlab.com/elmiko/stasis-reactor) I convinced myself
that a [source-to-image](https://github.com/openshift/source-to-image) build
pipeline was needed. Sadly, it was not needed, but I did learn how to enable
this inside of the GitLab CI system.

The difficulty with using source-to-image is that it relies on a running
docker daemon to perform the building of the image. There are
[some instructions](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)
on the GitLab site about how you might use docker builds inside the CI system,
but I was having trouble making these work properly. I don't have a private
enterprise version of GitLab, I am only using their upstream public offering.

Between the official documentation,
[this nice article](https://blog.callr.tech/building-docker-images-with-gitlab-ci-best-practices/)
by Florent Chauveau, and some liberal hacking I eventually got a working
`.gitlab-ci.yml` file. Here is that file:

```
image: docker:stable

variables:
  SR_TARGET_REGISTRY: quay.io/elmiko/stasis-reactor

services:
  - docker:dind

before_script:
  - echo -n $CI_JOB_TOKEN | docker login -u gitlab-ci-token --password-stdin $CI_REGISTRY

build_image:
  script:
    - wget -P /tmp https://github.com/openshift/source-to-image/releases/download/v1.1.14/source-to-image-v1.1.14-874754de-linux-amd64.tar.gz
    - tar xvf /tmp/source-to-image-v1.1.14-874754de-linux-amd64.tar.gz -C /tmp
    - /tmp/s2i build --url="tcp://docker:2375" . centos/nodejs-10-centos7 stasis-reactor:$CI_COMMIT_REF_NAME
    - ./hack/ci-push-image.sh
```

The main stumbling points I had during the process were the usage of the
`docker:stable` image as my base and the addition of the `docker:dind` service.
Together, these two components allowed me to have a docker running inside the
container _and_ access to the `docker` command from the shell inside that
container.

As you can see, I did have to download the source-to-image tool inside the
container, and I also needed a special script to push the resulting image
build. GitLab defines a number of
[environment variables](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html)
that are available inside the build container as well the ability
to create
[custom variables](https://docs.gitlab.com/ee/ci/variables/#creating-a-custom-environment-variable).
The latter are very useful because you can store secrets in these variables
and GitLab will protect their values on any logs or output interfaces. I used
these protected variables to inject the quay.io secrets so that my built images
would get pushed to that registry. The logic is all in the push script:

```
#!/bin/sh
set -x

if [ $CI_COMMIT_REF_NAME == "master" ]
then
docker login -u elmiko+stasisbot -p $SR_REGISTRY_TOKEN $SR_TARGET_REGISTRY
docker tag stasis-reactor:$CI_COMMIT_REF_NAME $SR_TARGET_REGISTRY:latest
docker push $SR_TARGET_REGISTRY:latest
fi
```

Once all these pieces were in place, I was able to have GitLab build and push
my images, using source-to-image, all from the CI gating. Pretty cool, but I
didn't end up needing it...
