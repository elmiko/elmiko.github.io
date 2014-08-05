---
layout: post
title:  "Creating Sahara clusters for vanilla 2.3.0 plugin"
date:   2014-03-28
categories:
---

Building some stuff from the ground up using the ReST API and httpie with
canned json objects.

Heavily inspired by the gating tests in [test\_vanilla\_two\_gating.py][v2gatepy]
and the workflow in the [OpenStack/Sahara Quickstart Guide][ossqg].

Where `SOME-FLAVOR-ID` exists in the json examples, the id was found by
selecting the appropriate entry after running `$ nova flavor-list`.

Where `SOME-FLOATING-IP-POOL-ID` exists in the json examples, the id was found
by selecting the appropriate entry after running `$ nova network-list`.

### NodeManager DataNode template

Made a file named `test-nm-dn-tmpl.json` containing the following:

    {
      "name": "test-nm-dn-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["nodemanager", "datanode"]
    }

Loaded with
`$ http $SAHARA_URL/node-group-templates X-Auth-Token:$AUTH_TOKEN < test-nm-dn-tmpl.json`

### NodeManager template

Made a file named `test-nm-tmpl.json` containing the following:

    {
      "name": "test-nm-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["nodemanager"]
    }

Loaded with
`$ http $SAHARA_URL/node-group-templates X-Auth-Token:$AUTH_TOKEN < test-nm-tmpl.json`

### DataNode template

Made a file named `test-dn-tmpl.json` containing the following:

    {
      "name": "test-dn-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["datanode"]
    }

Loaded with
`$ http $SAHARA_URL/node-group-templates X-Auth-Token:$AUTH_TOKEN < test-dn-tmpl.json`

### ResourceManager NameNode template

Made a file named `test-rm-nn-tmpl.json` containing the following:

    {
      "name": "test-rm-nn-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["resourcemanager", "namenode"]
    }

Loaded with
`$ http $SAHARA_URL/node-group-templates X-Auth-Token:$AUTH_TOKEN < test-rm-nn-tmpl.json`

### Cluster template

For this json the node group template ids will be need, they can be listed by
running `$ sahara node-group-template-list`.

Made a file named `test-cluster-tmpl.json` containing the following:

    {
      "name": "test-cluster-tmpl",
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "node_groups": [
      {
        "name": "master-node-rm-nn",
        "node_group_template_id": SOME-RM-NN-TEMPLATE-ID,
        "count": 1
      },
      {
        "name": "worker-node-nm-dn",
        "node_group_template_id": SOME-NM-DN-TEMPLATE-ID,
        "count": 2
      },
      {
        "name": "worker-node-dn",
        "node_group_template_id": SOME-DN-TEMPLATE-ID,
        "count": 1
      },
      {
        "name": "worker-node-nm",
        "node_group_template_id": SOME-NM-TEMPLATE-ID,
        "count": 1
      }
      ]
    }

Loaded with
`$ http $SAHARA_URL/cluster-templates X-Auth-Token:$AUTH_TOKEN < test-cluster-tmpl.json`

### Cluster create

For this json the cluster template id will be needed as well as an image id.
The cluster template id can be found by running
`$ sahara cluster-template-list` and the image id can be found by running
`$ sahara image-list`.

A keypair id will also be needed, this can be configured by running
`$ nova keypair-add testkp --pub-key $PATH_TO_PUBLIC_KEY`.

The management network id should be chosen from the list produced by
`$ nova network-list`.

Made a file named `cluster-1_create.json` containing the following:

    {
      "name": "cluster-1",
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "cluster_template_id" : SOME-CLUSTER-TEMPLATE-ID,
      "user_keypair_id": "testkp",
      "neutron_management_network": SOME-MANAGEMENT-NETWORK-ID,
      "default_image_id": SOME-IMAGE-ID
    }

Created with
`$ http $SAHARA_URL/clusters X-Auth-Token:$AUTH_TOKEN < cluster-1_create.json`

Logging in
----

After configuring everything and waiting for the cluster to become active, I
was able to login as the user `ec2-user` on the ResourceManager-NameNode
instance using the public key associated with the keypair registered earlier.

Next time, testing...

[ossqg]: http://docs.openstack.org/developer/sahara/devref/quickstart.html 
[v2gatepy]: https://github.com/openstack/sahara/blob/master/sahara/tests/integration/tests/gating/test_vanilla_two_gating.py
