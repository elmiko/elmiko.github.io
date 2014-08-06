---
layout: post
title:  "Accessing a Swift object using a Keystone trust in Python"
date:   2014-08-05
categories:
---

After my last effort
[using the ReST API to access Keystone's trust feature][1] I went on to
experiment with the Python interface using the [keystoneclient][2] package.
My goal was to allow a trustee user to access a trustor's Swift container via
the Python [swiftclient][3] package using a Keystone trust as the primary
means of authenticating.

Setup
----
I started by setting up a stock [DevStack](http://devstack.org/) on my 
[Fedora 20](http://fedoraproject.org/) machine, logging in as the `demo`
user, creating a container named `container1`, and uploading a [file][4] to
an object named `README`. After more than a few hours messing with the 
openstack cli tools and the Python repl, I ended up with the following 
snippet:

{% gist elmiko/91242b01c322afb028ee %}

Breakdown
----

First, I setup the authentication URLs for use with Keystone and Swift, we need
both version endpoints because the trust feature is only available in version
3 of Keystone, but Swfit does not have support for 3 yet. I'll use the v3
endpoint to create `keystoneclient.v3.Client` objects and the v2 to create
`swiftclient.client.Connection` objects.

{% highlight python %}
auth_url_v2 = 'http://localhost:5000/v2.0/'
auth_url_v3 = 'http://localhost:5000/v3/'
{% endhighlight %}

Lines 9 through 17 are standard Keystone client generation. I have setup my
devstack to use `openstack` as the password for all accounts. By default
DevStack starts with `demo` and `alt_demo` users, each belonging to a project
of the same name.

Assuming the Keystone controller supports the `OS-TRUST` endpoint, each
Client object will have a `TrustManager` which can be used to create new
trusts. Using the `demo` client object I create a trust with the
`alt_demo` user as the trustee, scoped to the `demo` project. I am using the
role name of `Member` for this trust delegation because it is one of the
default roles created by DevStack. This trust has no expiration, unlimited
reuses, and does not impersonate the trustor.

{% highlight python %}
trust = demo.trusts.create(trustor_user=demo.user_id,
                           trustee_user=alt_demo.user_id,
                           role_names=['Member'],
                           project=demo.tenant_id)
{% endhighlight %}

To allow the `alt_demo` user access to the `demo` user's Swift container
there are 2 pieces of information needed. The storage URL for Swift and a
valid Keystone authentication token.

To get the storage URL I create a Swift connection using the `demo` user.

{% highlight python %}
storageURL = swiftclient.Connection(authurl=auth_url_v2,
                                    user='demo',
                                    key='openstack',
                                    tenant_name='demo',
                                    auth_version="2.0").get_auth()[0]
{% endhighlight %}

Next, I create an authentication token for the `alt_demo` user scoped to the
trust delegated from `demo`. This needs to be a new token scoped to the trust
for Swift to allow us access using the storage URL.

{% highlight python %}
auth_token = keystoneclient.Client(auth_url=auth_url_v3,
                                   username=alt_demo.username,
                                   token=alt_demo.auth_token,
                                   trust_id=trust.id).auth_token
{% endhighlight %}

Finally I create the Swift connection for the `alt_demo` user using only the
storage URL and the newly minted authentication token. Then get the contents
of `container1` and it's child object `README`.

{% highlight python %}
alt_demo_swift = swiftclient.Connection(preauthurl=storageURL,
                                        preauthtoken=auth_token,
                                        auth_version="2.0")

result = alt_demo_swift.get_container('container1')
print(result)

result = alt_demo_swift.get_object('container1', 'README')
print(result)
{% endhighlight %}

When run from the terminal the results are:

    $ python swift_access.py
    ({'content-length': '168', 'x-container-object-count': '1', 'accept-ranges': 'bytes', 'x-storage-policy': 'Policy-0', 'date': 'Tue, 05 Aug 2014 03:44:47 GMT', 'x-timestamp': '1407199642.22169', 'x-trans-id': 'tx97e263d906ad4829b3d46-0053e0532f', 'x-container-bytes-used': '72', 'content-type': 'application/json; charset=utf-8'}, [{'bytes': 72, 'last_modified': '2014-08-05T00:48:27.624150', 'hash': '179f2435401d53ac4a699cf015134016', 'name': 'README', 'content_type': 'application/octet-stream'}])
    ({'content-length': '72', 'accept-ranges': 'bytes', 'last-modified': 'Tue, 05 Aug 2014 00:48:28 GMT', 'etag': '179f2435401d53ac4a699cf015134016', 'x-timestamp': '1407199707.62415', 'x-trans-id': 'tx551849b8f89d492c847aa-0053e0532f', 'date': 'Tue, 05 Aug 2014 03:44:47 GMT', 'x-object-meta-orig-filename': 'README.rst', 'content-type': 'application/octet-stream'}, 'Example Pig job\n===============\n\nThis script trims spaces in input text\n')

Final Thoughts
----

I had a few stumbles while trying to get this working, but in the end I'm
mostly pleased with the Python interface. Using the various
`Manager` objects is very easy once the proper client is configured and this
is one of the areas I needed to learn more about. Studying the
[OpenStack Identity API Reference][5], the
[Keystone Architecture Documentation][6], and the
[Identity section][7] of the OpenStack Cloud Administrator Guide proved very
effective in cementing the base Identity concepts. These documents cover
version 2.0 of the Identity API and trusts are part of version 3, but the
core concepts are the same.

Getting the role names correct is another area that I am still learning more
about. There is much functionality that is controlled based on the client
object's credentials. I would like to find an easy way to query the client's
role names and then use those names for a delegation. This proved challenging
for me as there are some roles which cannot be delegated(i.e. Service).
Luckily the roles are well defined in DevStack so I was able to pick one that
I knew was valid. I'm curious to learn more about the recommended role names
for administrators.

I'm also interested to learn more about the Barbican project as I understand
it is desgined for helping with shared secrets. I wonder if there is potential
in using it for helping to distribute information like the Swift storage URLs
or Keystone trust identifiers. Although neither of these pieces of information
are particularly sensitive or damaging on their own, it would still be nice
to find the most secure methods for transmission.

An interesting feature that will come for Keystone is
[endpoint scoped tokens][8], which would give even finer grained control over
the trusts that could be delegated.

All in all using trusts like this has been a good experience and shows a great
deal of opportunity for sharing all sorts of resources. Although this example
uses Swift, by delegating Heat privileges a trustee could be allowed to spawn
instances. I imagine with the proper tweaking this could be carried to any
service.


[1]: http://elmiko.github.io/openstack/keystone/2014/06/10/keystone-trust-delegation.html
[2]: http://docs.openstack.org/developer/python-keystoneclient/
[3]: http://docs.openstack.org/developer/python-swiftclient
[4]: https://raw.githubusercontent.com/openstack/sahara-extra/master/edp-examples/pig-job/README.rst
[5]: http://docs.openstack.org/api/openstack-identity-service/2.0/content/
[6]: http://docs.openstack.org/developer/keystone/architecture.html
[7]: http://docs.openstack.org/admin-guide-cloud/content/ch-identity-mgmt-config.html
[8]: https://blueprints.launchpad.net/keystone/+spec/endpoint-scoped-tokens

