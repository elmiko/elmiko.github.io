---
layout: post
title:  "Configuring sahara to use proxy domains"
date:   2015-06-25
categories:
---

Proxy domain usage is a feature that was added in the Juno release of
sahara[[1]]. It can be slightly confusing to configure, and there are a
few caveats about using it. This is a small guide about how I configure my
sahara controller to use them with regards to devstack.

- - -

Once I have devstack running (without starting sahara), and all the services
are available, I create the proxy domain in keystone. I do this by executing
the following bit of python:

    from keystoneclient.v3.client import Client

    auth_url = 'http://10.0.1.100:5000/v3'
    username = 'admin'
    password = 'openstack'
    project = 'admin'

    adm = Client(auth_url=auth_url,
                 username=username,
                 password=password,
                 project_name=project)

    resp = adm.domains.create('sahara_proxy')
    print(resp)

As you can see from this, my devstack is running on the machine at
`10.0.1.100` and uses the credentials `admin/openstack`. You will need to
adjust these values for your specific installation.

I instantiate a keystone v3 client object and then create the domain I wish
to use for a proxy, in this case I have named it `sahara_proxy`. Finally, I
print the result to confirm that the new domain has been created.

At this point I should mention the identity backend in keystone and how it
pertains to sahara's usage of the proxy domain. Sahara uses the proxy domain
to create temporary users that will be granted a trust from the currently
logged in user to that temporary user. This is done to create a throwaway
user whose credentials can be destroyed after the job for which they are
created has finished. To do this sahara will need the capability to create
users in keystone.

In devstack, keystone is configured to use sql for its identity backend. Using
keystone in this manner will allow other services (for example, sahara) to
create users in the sql identity backend. If the keystone controller you are
using has an LDAP identity backend, then this operation will not be possible.
This is due to the fact that keystone will not allow user creation in an
LDAP backed identity store. When the main identity backend in keystone is
LDAP, or a similar store that will not allow user creation, an alternative
domain-specific backend must be configured. For this I recommend creating an
sql backed identity store for the intended proxy domain. Instructions on how
to use the domain-specific identity drivers can be found in the keystone
documentation[[2]].

With keystone configured properly for its identity backend, we can proceed
to configure the sahara controller to use the new domain for its proxy
usage. This is done, in the most basic manner, by setting two options in the
sahara configuration file, as follows:

    [DEFAULT]
    use_domain_for_proxy_users=True
    proxy_user_domain_name=sahara_proxy

In the most basic example, this will be all the configuration that is needed
in sahara. But, there are situation where an operator has configured the
keystone roles to be different than the default configuration, or they have
purposely modified the role permissions. When this is the case, of modified
roles, the `proxy_user_role_names` option will also need to be configured
to reflect these changes.

As this type of configuration is highly installation dependent, I cannot
provide further advice about which roles will need to be added to the
configuration except to say that the proxy domain user will need to have a
role that will allow it to read from the object store. If, for example, you
have configured your OpenStack installation to have a separate role for users
who will access the object store, then you will need to add this role to the
list for the proxy users.

With all of these configurations in place, I can now start the sahara
controller. Sahara will allow its clusters to access objects in object
storage without the need for extra credentials. Without this feature, sahara
will require users to enter a username and password for each job binary and
data source which are stored in object storage.

This can be a slightly complicated feature to configure properly, depending
on your keystone installation, but provides a nice convenience to users and
a security improvement in the form of fewer credentials being stored with
sahara. I hope you have found this informative, and if you have further
questions please visit the #openstack-sahara channel on freenode, post a
message to the openstack mailing list, or contact me directly.


References
----

1. [http://docs.openstack.org/developer/sahara/userdoc/advanced.configuration.guide.html#object-storage-access-using-proxy-users](http://docs.openstack.org/developer/sahara/userdoc/advanced.configuration.guide.html#object-storage-access-using-proxy-users)
2. [http://docs.openstack.org/developer/keystone/configuration.html#domain-specific-drivers](http://docs.openstack.org/developer/keystone/configuration.html#domain-specific-drivers)

[1]: http://docs.openstack.org/developer/sahara/userdoc/advanced.configuration.guide.html#object-storage-access-using-proxy-users
[2]: http://docs.openstack.org/developer/keystone/configuration.html#domain-specific-drivers
