Creating images with diskimage-create.sh notes
====

1. clone sahara-image-elements from git://github.com/openstack/sahara-image-elements
2. install it into virtual environment from sahara stuff (not sure if this is needed)
3. run `sudo diskimage-create.sh -p vanilla` to test vanilla plugin
4. install images


side notes
----

running `diskimage-create.sh -p vanilla -i fedora` complains about OS and says
it is aborting but continues to run and extract images.

    Unknown Host OS. Impossible to build images.
    Aborting

creating a fedora image results in an error when it tries to install systemd

    error: unpacking of archive failed on file /usr/bin/systemd-detect-virt: 
    cpio: cap_set_file
