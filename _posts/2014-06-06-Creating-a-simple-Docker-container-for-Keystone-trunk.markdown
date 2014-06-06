---
layout: post
title:  "Creating a simple Docker container for Keystone trunk"
date:   2014-06-06
categories: docker keystone
---

*Big shoutout to Rob Rati, he had some excellent advise and a
[great blog post](http://rrati.github.io/blog/2014/05/09/apache-hadoop-plus-docker-plus-fedora-issues-and-limitations/)
that gave me inspiration for this simple example.*

Recently I have been doing some work with Swift and Keystone as they relate to
the Sahara project. I had been creating virtual machines to host the Keystone
and Swift servers because I wanted to gain greater control over running them
from Devstack.

After a few rounds of messing with virtual machines through libvirt, I decided
to give Docker a try to see if it made the process a tad more light weight. I
think it mostly did, but I have not had to do any networking outside of my
machine so that might add to my successes.

Here is a small breakdown of the procedure I used on my Fedora 20 machine to
install Docker and work through the process of getting a container running
with a trunk version of Keystone.

Install Docker

    # yum install -y docker-io

Get Fedora images

    # docker pull fedora

Create a Dockerfile for Keystone

{% gist elmiko/717e8ad3bc7099ef932f %}

Build an image from the Dockerfile

    # docker build -t testing/keystone - < Dockerfile

Start a container with Keystone running

    # docker run -d -p 5000:5000 -p 35357:35357 --name keystone1 testing/keystone

Test(using httpie instead of curl)

    $ http localhost:5000
    HTTP/1.1 300 Multiple Choices
    Content-Length: 753
    Content-Type: application/json
    Date: Fri, 06 Jun 2014 19:35:05 GMT
    Vary: X-Auth-Token

    {
        "versions": {
            "values": [
                {
                    "id": "v3.0", 
                    "links": [
                        {
                            "href": "http://localhost:5000/v3/", 
                            "rel": "self"
                        }
                    ], 
                    "media-types": [
                        {
                            "base": "application/json", 
                            "type": "application/vnd.openstack.identity-v3+json"
                        }, 
                        {
                            "base": "application/xml", 
                            "type": "application/vnd.openstack.identity-v3+xml"
                        }
                    ], 
                    "status": "stable", 
                    "updated": "2013-03-06T00:00:00Z"
                }, 
                {
                    "id": "v2.0", 
                    "links": [
                        {
                            "href": "http://localhost:5000/v2.0/", 
                            "rel": "self"
                        }, 
                        {
                            "href": "http://docs.openstack.org/", 
                            "rel": "describedby", 
                        "type": "text/html"
                    }
                    ], 
                    "media-types": [
                        {
                            "base": "application/json", 
                            "type": "application/vnd.openstack.identity-v2.0+json"
                        }, 
                        {
                            "base": "application/xml", 
                            "type": "application/vnd.openstack.identity-v2.0+xml"
                        }
                    ], 
                    "status": "stable", 
                    "updated": "2014-04-17T00:00:00Z"
                }
            ]
        }
    }

And presto! a working Keystone instance in a container. At this point it is
only configured as a basic server, to get further I will most likely need to
attach to the container and setup some users.

All in all a fairly painless process, getting the Dockfile correct took me the
most time but it wasn't difficult to debug given the way docker outputs to
stdout.
