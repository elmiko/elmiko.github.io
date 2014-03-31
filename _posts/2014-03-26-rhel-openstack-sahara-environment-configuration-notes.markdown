---
layout: post
title:  "Setting up an environment for OpenStack/Sahara devel on RHEL6.5"
date:   2014-03-26
categories: openstack sahara rhel
---

These are the steps I followed to install the RDO Icehouse release and the
trunk versions of Horizon and Sahara. The trunked Horizon/Sahara live in a
virtual environment to make messing with their configurations easier.

I have a feeling there is work that needs to be done configuring the network
bridge between the host system and the virtual network that OpenStack uses.

- - -

Base System
----

1. install os.

    I used RHEL6.5 server with the development workstation option.

2. give the user sudo priveleges.

    I created a user "stack", then became root and created the file
    `/etc/sudoers.d/stack`, with the only line being `stack ALL=(ALL) ALL`

3. register and add the optional channel [[1]].

    I used `rhn_register` to register rhel, then
    `rhn-channel --add --channel=rhel-x86_64-server-optional-6` to add the
    optional channel repo.
    Confirm the new channel is added with `rhn-channel --list`.

3. install epel [[2]]

4. install python-virtualenv (needs epel)

5. install libffi-devel (needs optional channel)


- - -

OpenStack
----

1. install openstack [[3]]

2. for convenience modify the keystone token format to UUID, found in 
`/etc/keystone/keystone.conf`

    I did this mainly to make working with tokens on the command line easier,
    the instructions for how to change the output type are specified in the
    configuration file.

3. restart keystone, `openstack-service restart keystone`


- - -

Setup a Virtual Environment
----

1. create an environment

2. activate it

3. install pbr, httpie, selenium, and mox into it with `pip install`


- - -

Sahara
----

1. activate virtualenv

2. git clone sahara from `git://github.com/openstack/sahara.git`

3. install sahara with `python setup.py install`

4. make an `etc` dir in the sahara virtualenv and copy `sahara.conf.sample` 
into it as `sahara.conf`

5. change the `os_admin_password` in `sahara.conf` to be same as specified in
`keystonerc_admin`

6. modify the upgrade method of `003_remove_java_job_fields.py` in the sahara
virtualenv.

    This file causes an exception when performing the schema creation, a simple
    solution is to comment out the body of the `upgrade` function and replace
    with a `pass`.

7. run the schema creation, 
`sahara-db-manage --config-file <sahara venv>/etc/sahara.conf upgrade head`

8. start sahara, `sahara-api --config-file <sahara venv>/etc/sahara.conf`

9. confirm it is working

    I confirmed this by sourcing the `keystonerc_admin`(as produced by 
    packstack) and `token_tenant_export`(a custom script [[4]]). Then using
    httpie to run
    `http http://localhost:8386/v1.1/$TENANT/jobs X-Auth-Token:$TOKEN`. If
    this command succeeds you will get a json object back showing an empty jobs
    list.


These steps are based on the virtualenv install notes from
[http://docs.openstack.org/developer/sahara/userdoc/installation.guide.html](http://docs.openstack.org/developer/sahara/userdoc/installation.guide.html)


- - -

Sahara Dashboard
----

1. activate virtualenv 

2. git clone dashboard from `git://github.com/openstack/sahara-dashboard`

3. install dashboard with `python setup.py install`


- - -

Horizon
----

1. activate virtualenv 

2. clone horizon from git://github.com/openstack/horizon

3. install horizon with `python setup.py install`

4. copy `openstack_dashboard/local/local_settings.py.example` to
`openstack_dashboard/local/local_settings.py` in the clone repo

5. modify `openstack_dashboard/local/local_settings.py` in clone repo [[5]]

    The modifications I made are; add the  local ip and `localhost` to 
    `ALLOWED_HOSTS`, add the proper `SAHARA_URL`, and add 
    `SAHARA_USE_NEUTRON=True`.

    *Update* I also copied the `SECRET_KEY` value from the
    `/etc/openstack-dashboard/local_settings` file to help reduce
    inconsistencies if running both Horizon dashboards at the same time.

6. modify `openstack_dashboard/settings.py` for sahara-dashboard [[5]]

    The modifications I made are the same as suggested in the guide; add
    `sahara` to `HORIZON_CONFIG`, and add `saharadashboard` to 
    `INSTALLED_APPS`.

7. start horizon by running `manage.py runserver ip:port`, make sure to use a
different port than the base install of horizon

8. point a browser at `http://ip:port` defined in the previous step


- - -

Updates
----

* (03/31/14) added a note about copying the SECRET\_KEY to Horizon install.


- - -

References
----

1. [http://eduard.linux.edu/install-openstack-rdo-redhat-6-5-dependecies-issues/](http://eduard.linux.edu/install-openstack-rdo-redhat-6-5-dependecies-issues/)
2. [http://fedoraproject.org/wiki/EPEL/FAQ#How_can_I_install_the_packages_from_the_EPEL_software_repository.3F](http://fedoraproject.org/wiki/EPEL/FAQ#How_can_I_install_the_packages_from_the_EPEL_software_repository.3F)
3. [http://openstack.redhat.com/QuickStartDevelRelease](http://openstack.redhat.com/QuickStartDevelRelease)
4. [https://gist.github.com/elmiko/be7d17dd50889cdff619](https://gist.github.com/elmiko/be7d17dd50889cdff619) 
5. [http://docs.openstack.org/developer/sahara/horizon/installation.guide.html](http://docs.openstack.org/developer/sahara/horizon/installation.guide.html)

[1]: http://eduard.linux.edu/install-openstack-rdo-redhat-6-5-dependecies-issues/
[2]: http://fedoraproject.org/wiki/EPEL/FAQ#How_can_I_install_the_packages_from_the_EPEL_software_repository.3F
[3]: http://openstack.redhat.com/QuickStartDevelRelease
[4]: https://gist.github.com/elmiko/be7d17dd50889cdff619 
[5]: http://docs.openstack.org/developer/sahara/horizon/installation.guide.html
