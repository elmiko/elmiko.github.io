general notes on working with rpms
====

pulling apart a known rpm
----

    rpm2cpio <rpm filename> | cpio -ivd 

this will unpackage the files into the current directory


building new rpms
----

information gleaned from https://fedoraproject.org/wiki/How_to_create_a_GNU_Hello_RPM_package

    rpmdev-newspec <name>

creates a new spec file in the current directory, this should most likely be
done in $HOME/rpmbuild/SPECS

    rpmbuild -ba <name>.spec

this will build the from the spec file, most likely to be run from the same
place as the previous command

at this point fixup errors in the spec files, once happy with the results

    rpmlint <name>.spec ../SRPMS/<name>* ../RPMS/<name>*

this will highlight any final warnings or errors, if more debug is needed run
`rpmlint -i`


testing new rpms
----

i used koji to test against the systems needed

    koji build --scratch <system> path/to/spec/<spec filename>


packaging
----

first clone the package

    fedpkg clone <package name>

import the srpm into the branches

    git checkout <branch>
    fedpkg import path/to/srpm/<srpm filename>

check the spec to make sure it has the proper info, also a good idea to run a
koji scratch build at this point(just to double check)

if things look good, commit and push the package

    fedpkg commit -p

or

    fedpkg commit
    fedpkg push

when ready run the package through fedpkg builder, this assumes pwd is the
root of the repo and in the proper branch

    fedpkg build

if there are errors, use the link provided to check the logs and look around

if necessary make changes to the spec and rebuild. standard git commands work
from within the repo.

when everything is looking good, and all builds work, run the update.

    fedpkg update

this will ask questions about the package and hopefully return a successful
result

notes for rdo stuff
----

in general

1. fix specs
2. do fedpkg stuff (rawhide, f20)
3. do rhpkg stuff (rhos-5.0-rhel-6, rhos-5.0-rhel-7)
4. do rdopkg builds
5. do rdopkg update


