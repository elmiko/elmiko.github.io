---
layout: post
title:  "Running the Operator SDK locally with an Ansible operator"
date: 2019-07-03
categories:
---

The [Operator SDK project](https://github.com/operator-framework/operator-sdk)
is a really cool framework to help you build Kubernetes operators. I've been
really intrigued about the Ansible style operators as they seem to offer a
great deal of convenience.

When developing and debugging operators it is really useful to be able to
run them locally without needing to install an image in a registry somewhere.
I've been trying to get an ansible based operator working with the
operator-sdk in local mode and struggling with the
[upstream instructions](https://github.com/operator-framework/operator-sdk/blob/master/doc/ansible/user-guide.md#2-run-outside-the-cluster).

This is what finally worked for me in Fedora 30 after:

1. make sure ansible is installed
1. install the following packages through `dnf`
   ```
   python3-ansible-runner
   python3-psutil
   python3-openshift
   ```
1. install the http runner for ansible with the following command:
   ```
   pip3 install --user ansible-runner-http
   ```
1. make a symbolic link for `/usr/bin/python` to `/usr/bin/python3`. i still
   don't understand this one, but for some reason when i run the ansible
   operator it tries to run python2 even though it knows where the python3
   binary is located.
1. you will most likely need to have a `cluster-admin` role if you are running
   on OpenShift

After all this I was able to run `operator-sdk up local` and my operator was
running fine. Now on to the debugging ;)
