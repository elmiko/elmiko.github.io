---
layout: post
title: "Delegating Keystone trusts through the ReST API"
date:   2014-06-10
categories:
---

Recently I have been investigating the Trusts feature of Keystone version 3.
During this exploration I have walked through many permutations of acquiring
and using the trust based authentication tokens. What follows is an example of
using the ReST API to delegate a trust from one user to another, and then use
that trust to generate an authentication token for the purposes of accessing
a Swift container owned by the first user.

###Setup

I am using a freshly updated [Devstack](http://devstack.org) on my
[Fedora 20](http://fedoraproject.org) installation. I have a very simple
local.conf file that sets all the passwords to `openstack`. This allows me
some flexibility when using the command line tools. I am also using the
[httpie](http://httpie.org) tool for making the ReST calls.

I have created a container for the `demo` user named `job1`, and set
the environment variables `OS_PASSWORD=openstack` and
`OS_AUTH_URL=http://10.0.1.62:5000/v2.0`. For reference the IP address of my
machine is currently `10.0.1.62`.

###The Process

####Collect IDs for the Trustor and Trustee

I start nice and simple by recording the IDs that will be needed for the
trust delegation. In this case user `demo` will be the trustor and `alt_demo`
the trustee.

{% highlight bash %}
$ keystone user-list
+----------------------------------+-------------------+---------+---------------------+
|                id                |        name       | enabled |        email        |
+----------------------------------+-------------------+---------+---------------------+
| cd7b3aa1f80f447f8f6b8c7d70cddc56 |      alt_demo     |   True  |                     |
| f0964f8ed640479fa1b24c334f8d9d8c |        demo       |   True  |   demo@example.com  |
{% endhighlight %}

####Collect Project ID

Next we will need the ID of the project that `alt_demo` should have
access to based on the trust.

{% highlight bash %}
$ keystone tenant-list
+----------------------------------+--------------------+---------+
|                id                |        name        | enabled |
+----------------------------------+--------------------+---------+
| 24ea2aa9dc234982afa4b2ca23ac3d36 |        demo        |   True  |
{% endhighlight %}

####Create a JSON File for the Trust Delegation

In this case I would like to delegate a trust that allows impersonation and
gives the trustee the role of `Member`. This access should allow the trustee
to read and write the container while keeping the trustor's identity. I'm
allowing impersonation so that if the trustee writes to the container the
ownership will remain with the trustor.

{% highlight json %}
trust_create.json
{
  "trust": {
    "impersonation": true,
    "project_id": "24ea2aa9dc234982afa4b2ca23ac3d36",
    "roles": [
        {
            "name": "Member"
        }
    ],
      "trustee_user_id": "cd7b3aa1f80f447f8f6b8c7d70cddc56",
      "trustor_user_id": "f0964f8ed640479fa1b24c334f8d9d8c"
  }
}
{% endhighlight %}

####Get a Token for the Trustor

We need a token scoped to the project for the trustor to authenticate the
delegation.

{% highlight bash %}
$ keystone --os-username=demo --os-tenant-name=demo token-get
+-----------+----------------------------------+
|  Property |              Value               |
+-----------+----------------------------------+
|  expires  |       2014-07-10T22:13:41Z       |
|     id    | 1acb40d200a64874b1dde102dfe14882 |
| tenant_id | 24ea2aa9dc234982afa4b2ca23ac3d36 |
|  user_id  | f0964f8ed640479fa1b24c334f8d9d8c |
+-----------+----------------------------------+
{% endhighlight %}

####Create the Trust

Using the JSON file we created earlier, we now create the trust. We will want
note the `id` of the trust created, in this case
`2d82fb8349d64c33babcd8f62b451aa7`.

{% highlight bash %}
$ http http://10.0.1.62:5000/v3/OS-TRUST/trusts X-Auth-Token:1acb40d200a64874b1dde102dfe14882 < trust_create.json 
HTTP/1.1 201 Created
Content-Length: 675
Content-Type: application/json
Date: Thu, 10 Jul 2014 21:14:37 GMT
Vary: X-Auth-Token

{
    "trust": {
        "expires_at": null, 
        "id": "2d82fb8349d64c33babcd8f62b451aa7", 
        "impersonation": true, 
        "links": {
            "self": "http://10.0.1.62:5000/v3/OS-TRUST/trusts/2d82fb8349d64c33babcd8f62b451aa7"
        }, 
        "project_id": "24ea2aa9dc234982afa4b2ca23ac3d36", 
        "remaining_uses": null, 
        "roles": [
            {
                "id": "40d1d753969b4aa99b2be2a8414da4b5", 
                "links": {
                    "self": "http://10.0.1.62:5000/v3/roles/40d1d753969b4aa99b2be2a8414da4b5"
                }, 
                "name": "Member"
            }
        ], 
        "roles_links": {
            "next": null, 
            "previous": null, 
            "self": "http://10.0.1.62:5000/v3/OS-TRUST/trusts/2d82fb8349d64c33babcd8f62b451aa7/roles"
        }, 
        "trustee_user_id": "cd7b3aa1f80f447f8f6b8c7d70cddc56", 
        "trustor_user_id": "f0964f8ed640479fa1b24c334f8d9d8c"
    }
}
{% endhighlight %}

####Get a Token for Trustee

Now we will need a token for the trustee to consume the trust. I have
specifically created a token that is not scoped to a project to show that
there is no connection between the trustee and the trusted project.

{% highlight bash %}
$ keystone --os-username=alt_demo --os-tenant-name= token-get
+----------+----------------------------------+
| Property |              Value               |
+----------+----------------------------------+
| expires  |       2014-07-10T22:17:48Z       |
|    id    | d2f4a38aa84f40a798f041d19d044d3d |
| user_id  | cd7b3aa1f80f447f8f6b8c7d70cddc56 |
+----------+----------------------------------+
{% endhighlight %}

####Create a JSON File for Trust Consumption

A simple file containing the trustee token we just acquired and the trust ID
we wish to consume.

{% highlight json %}
    trust_consume.json
    {
      "auth": {
        "identity": {
          "methods": [
            "token"
            ],
          "token": {
            "id": "d2f4a38aa84f40a798f041d19d044d3d"
          }
        },
        "scope": {
          "OS-TRUST:trust": {
            "id": "2d82fb8349d64c33babcd8f62b451aa7"
          }
        }
      }
    }
{% endhighlight %}

####Consume the Trust

This operation is the same as acquiring any other authentication token with
the exception that the token will be scoped to the newly created trust. I
have cut out the `catalog` contents as they are quite long.

{% highlight bash %}
$ http http://10.0.1.62:5000/v3/auth/tokens X-Auth-Token:d2f4a38aa84f40a798f041d19d044d3d < trust_consume.json 
HTTP/1.1 201 Created
Content-Length: 6815
Content-Type: application/json
Date: Thu, 10 Jul 2014 21:20:32 GMT
Vary: X-Auth-Token
X-Subject-Token: f0a1133ee9be40e693fb682d45871d50

{
    "token": {
        "OS-TRUST:trust": {
            "id": "2d82fb8349d64c33babcd8f62b451aa7", 
            "impersonation": true, 
            "trustee_user": {
                "id": "cd7b3aa1f80f447f8f6b8c7d70cddc56"
            }, 
            "trustor_user": {
                "id": "f0964f8ed640479fa1b24c334f8d9d8c"
            }
        }, 
        "catalog": [
            ...
        ], 
        "expires_at": "2014-07-10T22:17:48.000000Z", 
        "extras": {}, 
        "issued_at": "2014-07-10T21:20:32.879083Z", 
        "methods": [
            "token"
        ], 
        "project": {
            "domain": {
                "id": "default", 
                "name": "Default"
            }, 
            "id": "24ea2aa9dc234982afa4b2ca23ac3d36", 
            "name": "demo"
        }, 
        "roles": [
            {
                "id": "40d1d753969b4aa99b2be2a8414da4b5", 
                "name": "Member"
            }
        ], 
        "user": {
            "domain": {
                "id": "default", 
                "name": "Default"
            }, 
            "id": "f0964f8ed640479fa1b24c334f8d9d8c", 
            "name": "demo"
        }
    }
}
{% endhighlight %}

####Acquire a Trust Based Authentication Token

After consuming the trust we can use the `trust_consume.json` file again to
acquire an authentication token based solely on the trustee's identity. We
will get back a structure that is, more or less, the same as the result of the
trust consumption. In this case though we are concerned with the value of
X-Subject-Token as it contains our authentication token.

{% highlight bash %}
$ http http://10.0.1.62:5000/v3/auth/tokens X-Auth-Token:d2f4a38aa84f40a798f041d19d044d3d < trust_consume.json 
HTTP/1.1 201 Created
Content-Length: 6815
Content-Type: application/json
Date: Thu, 10 Jul 2014 21:29:23 GMT
Vary: X-Auth-Token
X-Subject-Token: 595714f8d9fc4a959ed47f1c9025820e

{
    "token": {
        "OS-TRUST:trust": {
            "id": "2d82fb8349d64c33babcd8f62b451aa7", 
                ...
{% endhighlight %}

####Determine the Storage URL

We need to use the storageURL as provided by Swift if we want to authenticate
with the trust based token. This is important to note as this is the only
root URL we will be able to use in conjuction with token based authentication.

{% highlight bash %}
$ swift --os-username=demo --os-tenant-name=demo stat -v
    StorageURL: http://10.0.1.62:8080/v1/AUTH_24ea2aa9dc234982afa4b2ca23ac3d36
    Auth Token: 24c6e577963f4c79b8cd37403add7a23
       Account: AUTH_24ea2aa9dc234982afa4b2ca23ac3d36
    Containers: 1
       Objects: 4
         Bytes: 77
X-Account-Storage-Policy-Policy-0-Bytes-Used: 77
   X-Timestamp: 1404835370.90232
X-Account-Storage-Policy-Policy-0-Object-Count: 4
    X-Trans-Id: tx3a5e4366defb4d2c84f3d-0053bf04ff
  Content-Type: text/plain; charset=utf-8
 Accept-Ranges: bytes
{% endhighlight %}

####Confirm that it Works

With our freshly minted trust based authentication token, we will now attempt
to access the contents of Swift scoped to the `demo` user. We are not actually
accessing an object, but merely reading the contents of Swift to show us the
available containers. To access a container or object, append them to the
storageURL (i.e. `http://storageURL/container/object`).

{% highlight bash %}
$ http http://10.0.1.62:8080/v1/AUTH_24ea2aa9dc234982afa4b2ca23ac3d36 X-Auth-Token:595714f8d9fc4a959ed47f1c9025820e
HTTP/1.1 200 OK
Accept-Ranges: bytes
Content-Length: 5
Content-Type: text/plain; charset=utf-8
Date: Thu, 10 Jul 2014 21:29:39 GMT
X-Account-Bytes-Used: 77
X-Account-Container-Count: 1
X-Account-Object-Count: 4
X-Account-Storage-Policy-Policy-0-Bytes-Used: 77
X-Account-Storage-Policy-Policy-0-Object-Count: 4
X-Timestamp: 1404835370.90232
X-Trans-Id: txbadf1cf3089e4ca9aa0ff-0053bf05c3

job1

{% endhighlight %}

####Revoke the Trust

Now we will revoke the trust using the trustor's authentication token. This
will invalidate the trust based token acquired by the trustee.

{% highlight bash %}
$ http DELETE http://10.0.1.62:5000/v3/OS-TRUST/trusts/2d82fb8349d64c33babcd8f62b451aa7 X-Auth-Token:1acb40d200a64874b1dde102dfe14882
HTTP/1.1 204 No Content
Content-Length: 0
Date: Thu, 10 Jul 2014 21:36:00 GMT
Vary: X-Auth-Token




{% endhighlight %}

####Confirm that Trust has been Revoked

Finally we confirm that the trust has indeed been revoked by attempting to
access the Swift storageURL using the trust based token generated earlier.

{% highlight bash %}
$ http http://10.0.1.62:8080/v1/AUTH_24ea2aa9dc234982afa4b2ca23ac3d36 X-Auth-Token:595714f8d9fc4a959ed47f1c9025820e
HTTP/1.1 401 Unauthorized
Content-Length: 131
Content-Type: text/html; charset=UTF-8
Date: Thu, 10 Jul 2014 21:36:57 GMT
Www-Authenticate: Swift realm="AUTH_24ea2aa9dc234982afa4b2ca23ac3d36"
X-Trans-Id: txa17b6b5ee45b47339f0f9-0053bf0779

<html><h1>Unauthorized</h1><p>This server could not verify that you are authorized to access the document you requested.</p></html>

{% endhighlight %}

###Conclusion

This is a very simple example but it shows how trusts can be used to share
Swift resources between users in different projects. I like the idea of
trusts because it allows a developer to provide limited access control without
having to get into the business of credential management. There is much more
depth to the trust mechanism than what is shown here but as I have learned,
Keystone is a deep well. 

In my next installment I'll get into
using the python client interfaces to perform the same operation.

For more reading check out:

[Official Trust API](https://github.com/openstack/identity-api/blob/master/v3/src/markdown/identity-api-v3-os-trust-ext.md)

[Keystone Documentation](https://docs.openstack.org/developer/keystone)

[Identity API v2.0](http://docs.openstack.org/api/openstack-identity-service/2.0/content/)
