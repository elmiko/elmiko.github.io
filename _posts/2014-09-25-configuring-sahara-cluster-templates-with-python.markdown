---
layout: post
title:  "Configuring Sahara cluster templates with the Python client"
date:   2014-09-25
categories:
---

*Shout out to [Erik Erlandson](http://erikerlandson.github.io) for
introducing me to Baker.*

Recently I have been working on some issues in [Sahara][1] which require me
to observe the creation and destruction of multiple clusters. I also
frequently need to restart [DevStack][2] and then get my stack configured for
the tests I want to run. In the past I have used the Horizon interface and the
ReST API to perform operations with Sahara. This time around I wanted to
investigate the Python [saharaclient][3] interface to do the same.

One of the things I really enjoy about the Python interface to OpenStack is
using the REPL to query and manipulate a stack. I like the immediacy of being
able to interact with the stack and run small pieces of code if need be. The
objects also act as a quick way to filter the information coming back from
the various services.

Much of this could be achieved with a few bash scripts and templated json
files through the ReST interface, or with the Sahara command line tool, and
I don't consider the Python interface to be a superior method of interactions,
but I do find it to be a useful tool for my needs and an interesting window
into OpenStack. I'm also a child of
[Logo](https://en.wikipedia.org/wiki/Logo_(programming_language))
, which makes REPL type software feel very familiar to me.

####Setup

I am running all these commands against an install of
[DevStack][2] that I have slightly customized by changing
the passwords and some of the services. I am running the Neutron network
service and I have disabled Sahara because I want to run a custom version for
debugging. All of this code should run on a default installation of
Sahara, so it should not be necessary to run a custom install.

####Code

What follows are snippets of code that I assembled into a small file to run
from the command line for automating cluster configuration. There are a few
other steps I optionally perform with Keystone and Swift, but I'll save those
for a more general post. I'll go over each of the snippets with a small
explanation and then present the entire script at the end.

First I setup some variables to use with the clients I'll need to interact
with the stack. I'm using the v2 Keystone interface here more for convenience
as I've found some inconsistencies when using v3. I need to keep track of the
different project names so that I can create an admin scoped token with the
Neutron client and the non-admin for my Sahara work.

{% highlight python %}
ADMIN_USERNAME='admin'
ADMIN_PASSWORD='openstack'
ADMIN_PROJECT_NAME='admin'
AUTH_URL='http://localhost:5000/v2.0'
NETWORK_URL='http://localhost:9696'
SAHARA_PROJECT_NAME='demo'
{% endhighlight %}

This function creates the Sahara client, all the OpenStack Python interfaces
use this methodology of client objects. The clients provide a wrapper around
the ReST calls that are made to the underlying services. Most of the client
interfaces I've worked with also provide manager objects to work with the
underlying collections that they wrap. In the case of a Sahara client object
this might look like `client.clusters`, which returns an interface to the
`/clusters` endpoint.

{% highlight python %}
def sahara_client():
    return sahara.Client(auth_url=AUTH_URL,
                         username=ADMIN_USERNAME,
                         api_key=ADMIN_PASSWORD,
                         project_name=SAHARA_PROJECT_NAME)
{% endhighlight %}

In order to create cluster templates I need to know the management and
floating pool network identifiers I'd like to use with my cluster instances.
To do this I'm going to instantiate a Neutron client and query the networks,
this is where I need the admin project scoping.

{% highlight python %}
def get_public_private_nets():
    '''Returns (public id, private id).'''
    c = neutron.Client(api_version='2.0',
                       auth_url=AUTH_URL,
                       endpoint_url=NETWORK_URL,
                       username=ADMIN_USERNAME,
                       password=ADMIN_PASSWORD,
                       tenant_name=ADMIN_PROJECT_NAME)
    retval = {}
    for net in c.list_networks().get('networks', []):
        if net.get('name') in ['public', 'private']:
            retval[net.get('name')] = net.get('id')
    return (retval.get('public'), retval.get('private'))
{% endhighlight %}

Next I put together a function to create a template for a cluster configured
with the vanilla Hadoop 2.4.1 plugin. This is a very basic cluster but my
testing is quite simple in this case. I am using the method of embedding my
node group templates into the cluster template. Alternatively, I could have
created node group templates separately and then referenced their identifiers
in the cluster template. For my tesing purposes though, I won't need to reuse
the node groups so I'll keep the template creation to a minimum.

It's worth noting that for the most part the cluster template dictionary is
equivalent to the JSON representation with the exception of the
`neutron_management_network` key. The key for the management network
identifier is `net_id` in the saharaclient. I'm not sure exactly why this
exists, from looking at the source I imagine it is a backward compatibility
with versions of Sahara that defaulted to Nova networking.

{% highlight python %}
def cluster_template_vanilla24(name='vanilla24'):
    float_pool, mgmt_net = get_public_private_nets()
    return {
        'name': name,
        'plugin_name': 'vanilla',
        'hadoop_version': '2.4.1',
        'net_id': mgmt_net,
        'cluster_configs': {},
        'node_groups': [
            {
                'count': 1,
                'name': 'v24-master',
                'flavor_id': '2',
                'node_processes': ['namenode',
                                   'oozie',
                                   'resourcemanager',
                                   'historyserver'],
                'floating_ip_pool': float_pool
            },
            {
                'count': 3,
                'name': 'v24-worker',
                'flavor_id': '2',
                'node_processes': ['datanode',
                                   'nodemanager'],
                'floating_ip_pool': float_pool
            }
        ]
    }
{% endhighlight %}

Lastly, I put it all together with a wrapper function to create the cluster
template on the Sahara server and return the resulting object. This function
shows an example of how to use one of Sahara's manager objects. The call to
`cluster_templates.create` is functionally equivalent to making a POST to the
`/cluster-templates` endpoint on the Sahara server. To further manipulate the
cluster templates on the server I could also call `.list` to perform a GET on
the endpoint, or call `.get(<id>)` to do the equivalent of a GET on
`/cluster-templates/<id>`.

{% highlight python %}
def create_cluster_vanilla24():
    s = sahara_client()
    t = cluster_template_vanilla24()
    return s.cluster_templates.create(**t)
{% endhighlight %}

At this point what I usually do is import the file in the Python REPL and use
the functions directly. Something along the lines of:

    >>> import config_sahara as c_s
    >>> c_s.create_cluster_vanilla24()

Recently though, I have been introduced to the
[Baker](https://bitbucket.org/mchaput/baker/wiki/Home) package which
facilitates making command line scripts. Instead of needing to create a rich
interface with `argparse` all I need to do is expose a function or two. This
is where Baker really helps outs. Instead of invoking the Python REPL I might
just run the script from the command line. When combined with multiple
cluster templates this becomes a quick way to get things setup. For example:

    $ ./configs_sahara.py vanilla24
    Cluster Template {u'neutron_management_network': u'23d26aa0-6a86-4ee7-874f-e92d4157a0a1', u'description': None, u'cluster_configs': {}, u'created_at': u'2014-09-26 03:27:41', u'default_image_id': None, u'updated_at': None, u'plugin_name': u'vanilla', u'anti_affinity': [], u'tenant_id': u'e4d4f5b56ed647e3bc4cef323432d61d', u'node_groups': [{u'count': 3, u'name': u'v24-worker', u'volume_mount_prefix': u'/volumes/disk', u'created_at': u'2014-09-26 03:27:41', u'updated_at': None, u'floating_ip_pool': u'2aa5e578-59b5-42dc-a826-1f9d0f1a0bf1', u'image_id': None, u'volumes_size': 0, u'node_processes': [u'datanode', u'nodemanager'], u'node_group_template_id': None, u'volumes_per_node': 0, u'node_configs': {}, u'auto_security_group': False, u'security_groups': None, u'flavor_id': u'2'}, {u'count': 1, u'name': u'v24-master', u'volume_mount_prefix': u'/volumes/disk', u'created_at': u'2014-09-26 03:27:41', u'updated_at': None, u'floating_ip_pool': u'2aa5e578-59b5-42dc-a826-1f9d0f1a0bf1', u'image_id': None, u'volumes_size': 0, u'node_processes': [u'namenode', u'oozie', u'resourcemanager', u'historyserver'], u'node_group_template_id': None, u'volumes_per_node': 0, u'node_configs': {}, u'auto_security_group': False, u'security_groups': None, u'flavor_id': u'2'}], u'hadoop_version': u'2.4.1', u'id': u'5193f5a9-6c85-4697-8a28-106aa00c185b', u'name': u'hdp2'}

Messy, but I think with a little help from the `json` package it could be made
more readable. Similar output will be generated in the REPL if using the
commands directly. It's worth noting that once you put Baker into the script
it won't import cleanly anymore into the REPL. Next time I visit this topic
I'll present a little larger script showing a more indepth stack configuration
for use with one of Sahara's new features for Juno.

This is the script that I generated to use with creating
vanilla Hadoop 2.4.1 and HDP 2.0.6 clusters. Thanks for reading and happy
hacking!

{% gist elmiko/02cc89528532be34329d %}



[1]: http://docs.openstack.org/developer/sahara
[2]: http://devstack.org
[3]: http://docs.openstack.org/developer/python-saharaclient
