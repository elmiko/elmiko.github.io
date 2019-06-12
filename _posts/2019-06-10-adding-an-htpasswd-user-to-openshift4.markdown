---
layout: post
title:  "Adding an htpasswd user to OpenShift 4"
date: 2019-06-10
categories:
---

Something i've been doing a lot of recently and i'm sure i will need a pointer
back to it. When OpenShift is using htpasswd for its authentication provider,
adding new users/credentials is easier than ever.

**Prerequisites**

1. shell with the `oc` and `htpasswd` commands
1. OpenShift credentials with `cluster-admin` role

**Procedure**

1. create an `htpasswd` file for the cluster. this should probably contain all
   the users you want to be in there, so make sure it has everything.
   _if updating an old file, drop the `-c`_
   ```
   htpasswd -c -B -b ./openshift.htpasswd user1 secret
   ```
1. Add more users as necessary.
1. Create the manifest for the cluster secret. This is used by the authentication
   provider to read the individual credentials, i am doing this as a dry run
   to create a file for the manifest because the secret should exist already.
   ```
   oc create secret generic htpass-secret \
       --from-file=htpasswd=./openshift.htpasswd \
       --namespace openshift-config \
       --dry-run \
       --output yaml > ./htpass-secret.yaml
   ```
1. Replace the existing secret, this could be done as a pipe from the previous
   command.
   ```
   oc replace --filename ./htpass-secret.yaml
   ```

If everything has worked, you should now be able to login as the newly
identified user.

**Additional resources**

* [Configuring an HTPasswd identity provider](https://docs.openshift.com/container-platform/4.1/authentication/identity_providers/configuring-htpasswd-identity-provider.html)
