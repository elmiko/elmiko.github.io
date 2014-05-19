Introduction to OpenStack Trove: A Multi-database Deployment with MongoDB and MySQL
====

what is trove?
a system for managing and controlling databases
an api and impl
automate admin tasks
- managed
- scaling
- ha
- multi-tenancy
- efficieny of resources

uses openstack as a blackbox
nova for compute
cinder for blk stor
neutron for network
swift for backups
glance

fully functional rest api
dedicated guest agent
designed with pluggability in mind

guest agent sits in each vm to help with communication, health, ha, etc
started as mysql, but can support any sql or no-sql

rest api
- spin up instances
- create replicas
- resize
- add users/dbs manage grants
- manage backups
- change configs

goal to enhance user experience

optimal db configs
- secure when provisioned
- appropriate config applied
- no ssh (user should not have to get on machine and manage directly)

optimize use of hardware

integrated in icehouse

hands off approach
automate as much as possible to reduce the need for direct interaction from
ops/devs

could trove be a building block for every openstack service?
manage the nova db? (inception)

concepts
datastore
- abstraction of the underlying db
- currently supports, mysql, mongodb, percona, couchbase, cassandra, redis
datastore version
- represents a released version of a datastore
- provide linkage to guest image stored in glance
configuration group
- represents a collection of datastore specific configs

installation
controller node has a database component
guest images in glance

compute node
nova instance with a mysql guest agent
nova instance with a mongo guest agent

confg
keystone tenant/user/service
keystone endpoint
trove datastore

can update configs across all instances in a single operation

backups, incremental, point in time

