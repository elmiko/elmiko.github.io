rhpkg process notes
====

rhpkg clone

rhpkg import

rhpkg commit -p

rhpkg build


openstack-sahara specific
----

requires python-sphinxcontrib-httpdomain

had to get it added to the available candidate packages
this step required getting someone to create the branches in the rhrepo
thanks to gsterling

suggested i pull the source into an rhpkg repo then build
then get it tagged for -override branch
-override allows bringing packages into the inheritance chain


useful commands
----

brew list-pkgs --tag

brew list-tag-inheritance
