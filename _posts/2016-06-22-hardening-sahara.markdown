---
layout: post
title:  "Hardening OpenStack Sahara with Castellan and Barbican"
date:   2016-06-22
categories:
---

During the Mitaka cycle, the
[Sahara project](http://docs.openstack.org/developer/sahara/index.html) made
a big step forward in the effort to help operators secure their deployments.
This change comes in the form of a new integration between Sahara and
[Barbican, the OpenStack Key Manager service](http://docs.openstack.org/developer/barbican/).

I'm going to delve into Barbican a little and talk about a sister project,
[Castellan](http://docs.openstack.org/developer/castellan/), as well as
provide some example configurations to demonstrate how you can integrate
these projects into your Sahara deployment.

First though, let's talk about why you might need or want this feature.
Sahara is capable of deploying many types of data processing frameworks,
and in the course of these deployments there are several sensitive services
(e.g. databases, workflow managers, etc.) that must also be configured and
started.

To ensure that these sensitive services are as secure as possible, the
Sahara team decided to pursue a course of action to remove itself from the
business of storing the associated service credentials. By integrating with
the Barbican project, we can rest easy knowing that we are leveraging the
work of many excellent cryptography professionals.

<img class="center" src="http://i.imgur.com/jxmKHrX.png">

Barbican, as noted earlier, is the key manager service for OpenStack. This
means that it can handle sensitive information(such as keys or passwords) and
store them in a secure manner. By default, Barbican will store secrets as
encrypted blobs in a database but, with some configuration it can use much
more secure datastores such as hardware security modules(HSMs).

The size of these secrets is limited, but more than enough for RSA keys,
plain text passwords, and other small data.

To help ease the transition for OpenStack projects, from a developer
perspective, there is Castellan. This project is an abstraction around the
key manager service and allows for multiple key manager implementations to
be used with a consistent API. This project was of great help in migrating
Sahara to use Barbican.

The ability to craft different key manager implementations was crucial to the
acceptance of Barbican with the Sahara team as it allowed us to maintain
perfect backward compatibility while still providing a path forward for users
who wish to improve security. The necessity for backward compatibility is
dictated by the way that Sahara had previously stored sensitive information
in its database. With this in mind, we created an implementation that matched
our current secret store that will also work seamlessly with a Barbican
implementation as well.

## Configuration details

Before you begin configuring Sahara, you will want to have a Barbican
instance running within your OpenStack deployment. This is covered in the
(Barbican for Operators documentation)[http://docs.openstack.org/developer/barbican/setup/index.html].

With Barbican as part of your stack you are now ready to have Sahara begin
storing its secrets externally. There are a couple configuration values
which will make this happen.

The first and foremost configuration is to turn on the external store, the
following should be placed in your `sahara.conf` file:

```
[DEFAULT]
use_barbican_key_manager = True
```

At this point, if you have followed the recommended Barbican installation
you are all done. Simply restart Sahara and it will begin storing its
secrets externally. Wasn't that easy!

This configuration relies on Barbican being discoverable from the service
catalog. If this is not the case in your stack, or you have a more
complicated Barbican deployment (perhaps with several controllers), then
Castellan provides several options for further configurations.

Let us assume that you have configured a Barbican endpoint with an internal
DNS entry of `barbican.internal.myorg.com` and the default port, you would
add the following to your `sahara.conf`:

```
[castellan]
barbican_api_endpoint=http://barbican.internal.myorg.com:9311/
barbican_api_version=v1
```

Through Castellan, Sahara will now be using your Barbican instance at
`barbican.internal.myorg.com`.

## Caveat

It is important to note, that if you have previously deployed clusters with
Sahara and then turn this option on that the old passwords will not be
migrated and you may encounter errors when retrieving them. This is a
limitation in Sahara currently and an issue for further exploration.
