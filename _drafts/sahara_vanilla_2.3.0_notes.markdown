Creating sahara clusters for vanilla 2.3.0 plugin
====

Building some stuff from the ground up using the REST API and httpie with
canned json objects.

Heavily inspired by the gating tests in [test_vanilla_two_gating.py][v2gatepy]
and the workflow in the [OpenStack/Sahara Quickstart Guide][ossqg].

Where `SOME-FLAVOR-ID` exists in the json examples, the id was found by
selecting the appropriate entry after running `nova flavor-list`.

Where `SOME-FLOATING-IP-POOL-ID` exists in the json examples, the id was found
by selecting the appropriate entry after running `nova network-list`.

### NodeManager DataNode template

    {
      "name": "test-nm-dn-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["nodemanager", "datanode"]
    }

### NodeManager template

    {
      "name": "test-nm-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["nodemanager"]
    }

### DataNode template

    {
      "name": "test-dn-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["datanode"]
    }

### ResourceManager NameNode template

    {
      "name": "test-rm-nn-tmpl",
      "flavor_id": SOME-FLAVOR-ID,
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "floating_ip_pool": SOME-FLOATING-IP-POOL-ID,
      "node_processes": ["resourcemanager", "namenode"]
    }

### Cluster template

For this json the node group template ids will be need, they can be listed by
running `sahara node-group-template-list`.

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

### Cluster create

For this json the cluster template id will be needed as well as an image id.
The cluster template id can be found by running `sahara cluster-template-list`
and the image id can be found by running `sahara image-list`.

A keypair id will also be needed, this can be configured by running
`nova keypair-add testkp --pub-key $PATH_TO_PUBLIC_KEY`.

The management network id should be chosen from the list produced by
`nova network-list`.

    {
      "name": "cluster-1",
      "plugin_name": "vanilla",
      "hadoop_version": "2.3.0",
      "cluster_template_id" : SOME-CLUSTER-TEMPLATE-ID,
      "user_keypair_id": "testkp",
      "neutron_management_network": SOME-MANAGEMENT-NETWORK-ID,
      "default_image_id": SOME-IMAGE-ID
    }

Logging in
----

After configuring everything and waiting for the cluster to become active, I
was able to login as the user `ec2-user` on the ResourceManager-NameNode
instance using the public key associated with the keypair registered earlier.

Next time, testing...

[ossqg]: http://docs.openstack.org/developer/sahara/devref/quickstart.html 
[v2gatepy]: https://github.com/openstack/sahara/blob/master/sahara/tests/integration/tests/gating/test_vanilla_two_gating.py
