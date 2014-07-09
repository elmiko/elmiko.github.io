Consistency Across OpenStack REST APIs
====

v3 has a new system for writing extensions

nova set the groundwork for much api work

need for convergence across projects without strict enforcement
"soft" enforcement, perhaps by style guide?

lack of consistent nomenclature across projects

tenant v project
coming down from keystone, migration from tenant to project
much work to be done renaming tenant related stuff, clis still call out tenant
tenant has to be supported
new code should reference project

instance v server
user facing refers to servers, internally instance is consistent


support for better filters?
non-text parameter filtering
re: filtering, complex query in ceilomoter v2 api
http://docs.openstack.org/developer/ceilometer/webapi/v2.html#capabilities

pagination consistency across projects?
there is a blueprint talking about this, but it is complicated by the number
of backends available (mysql v non)

extensions or not?
discoverable schema format?
