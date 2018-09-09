---
layout: post
title:  "Weekend Code Hacker 004"
subtitle: "Introducing deswag, a tool for creating code."
date: 2018-09-18
categories:
---

As a student of software development, and really just hacking on code in
general, I have always been drawn more towards things at the operating
system and tooling layers of the software cake. For the last few years I've
had a great opportunity to indulge my love of application programming
interfaces (APIs) by serving as a member of the
[OpenStack API SIG](https://wiki.openstack.org/wiki/API_SIG).

During my time in the OpenStack community I have learned a great deal about
[RESTful APIs](https://en.wikipedia.org/wiki/Representational_state_transfer)
as well as several other cool API-related technologies (
[GraphQL](https://en.wikipedia.org/wiki/GraphQL),
[gRPC](https://en.wikipedia.org/wiki/GRPC), and the like). This exposure
naturally led me to investigate schemas for describing APIs such as
[WADL](https://en.wikipedia.org/wiki/Web_Application_Description_Language)
and [OpenAPI](https://en.wikipedia.org/wiki/OpenAPI_Specification), and it is
the latter that I write about today.

## Standardizing APIs

One thing that I have noticed about software projects that involve external
APIs, or API gateways, is that having a good way to express that API is
fundamental to promoting its usage and health. The reason I say this is that
first it just makes sense that any API with good documentation is going to
get more usage than one without. Second, by having **_structured_** documentation
for an API you open up all manners of introspection and automation that can
be created, which I have found to be tremendously useful and powerful.

When I started working on the [radanalytics.io](https://radanalytics.io)
community project, one of the first things we created was a REST-based
service to do work inside of OpenShift ([oshinko-rest](https://github.com/radanalyticsio/oshinko-rest)). To rapidly jumpstart our progress we used OpenAPI (then known as
swagger) to describe our REST API, and then a code generation tool to create
our server and client frameworks. This worked beautifully and got us running
a server in no time.

<img src="/img/deswag-1.svg" class="img-responsive center-block" alt="code generator">

Although the code generation tools were great for getting a rapid start, we
did run into issues as we wanted to further customize our server. When using
code generators you are usally ill-advised to mess with the generated files
before checking them in. Mainly because these types of customizations can
become very brittle when using a fully automated pipeline. But, most
code generator projects give the user hooks that they can use to customize
the output. In our case we needed to modify things in the authentication
pipeline as well as other logging related parts of our server and the
generated code simply was not flexible to handle our changes. The code soon
became very complex and brittle to changes.

## Customizing APIs

The above story is just one case where I have run into issues with the
process of generating code automatically from schemas. What I really wanted
was a tool that would give me maximum flexibility for creating my source code.
Enter [deswag](https://gitlab.com/elmiko/deswag).

The idea behind deswag is to combine a few well-known technologies into an
easy to use tool for creating arbitrary output from OpenAPI schemas. It
uses [Jinja](http://jinja.pocoo.org) as the basis for the template mechanism,
and of course [OpenAPI](https://github.com/OAI/OpenAPI-Specification) for
the schema format.

<img src="/img/deswag-2.svg" class="img-responsive center-block" alt="deswag code generator">

I envisioned this tool to be used for creating source code from the API
schemas, but as the templates are really open-ended you can create whatever
output your imagination can invent.

## Deswag in action

My "Hello World" for deswag is based on the
[Minimal Pet Store example](https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/yaml/petstore-minimal.yaml) from the OpenAPI project. I combine that
schema with a custom template to produce a skeleton for a Python
[Flask](http://flask.pocoo.org) server.

The schema looks like this:

```
---
  swagger: "2.0"
  info: 
    version: "1.0.0"
    title: "Swagger Petstore"
    description: "A sample API that uses a petstore as an example to demonstrate features in the swagger-2.0 specification"
    termsOfService: "http://swagger.io/terms/"
    contact: 
      name: "Swagger API Team"
    license: 
      name: "MIT"
  host: "petstore.swagger.io"
  basePath: "/api"
  schemes: 
    - "http"
  consumes: 
    - "application/json"
  produces: 
    - "application/json"
  paths: 
    /pets: 
      get: 
        description: "Returns all pets from the system that the user has access to"
        produces: 
          - "application/json"
        responses: 
          "200":
            description: "A list of pets."
            schema: 
              type: "array"
              items: 
                $ref: "#/definitions/Pet"
  definitions: 
    Pet: 
      type: "object"
      required: 
        - "id"
        - "name"
      properties: 
        id: 
          type: "integer"
          format: "int64"
        name: 
          type: "string"
        tag: 
          type: "string"
```

This definition is quite bare, it only describes a single endpoint (`/pets`),
with a single related resource (`Pet`).

I take that schema and combine it with my template:

{% raw %}
```
import flask

app = flask.Flask(__name__)
{% for path, pathitem in paths.items() %}{% for method, operation in pathitem.items() %}

@app.route('{{ [basePath, path]|join|replace('{', '<')|replace('}', '>') }}', methods=['{{ method }}'])
def route{{ path|replace('/', '_')|replace('{', '')|replace('}', '') }}_{{ method }}():
    # insert business logic for {{ method }} on {{ path }} here
    return "Not Implemented", 501
{% endfor %}{% endfor %}
```
{% endraw %}

This template is going to setup a Flask application object for me and then
loop through the endpoints in the OpenAPI schema to create the appropriate
route listeners in my application. When I run the deswag command on this
schema and template I get a piece of code that looks like this:

```
import flask

app = flask.Flask(__name__)

@app.route('/api/pets', methods=['get'])
def route_pets_get():
    # insert business logic for get on /pets here
    return "Not Implemented", 501
```

Not much output for all that work! You can see that there isn't much here
just a function that returns a nasty `501` to the client. What I could do from
here though is to modify my template so that it could call functions based
on reliable names from the schema and in that manner start to build a binding
between my view code and the controller that might be behind it.

## The road goes ever on

I hope this is just the beginning for deswag, I have a bunch of ideas about
how to expand it to be more useful and also create some sample templates that
people could use to start their hacking. I also want to improve the docs and
get a small website running for it. I am already starting to use deswag with
some of my personal projects so at the least I will start to trip over bugs
soon!

If you have any thoughts or ideas about this project, please leave a comment,
open an issue, or even propose a pull request at
[https://gitlab.com/elmiko/deswag](https://gitlab.com/elmiko/deswag). This
project is GPL-licensed and I firmly believe in the open source process and
workflow.

I hope you check it out, maybe try to run it for yourself, and at the the
very least...

have fun and happy hacking =)

### Links

* [deswag code](https://gitlab.com/elmiko/deswag)

* [OpenAPI Initiative](https://www.openapis.org/)

* [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification)

* [Jinja documentation](http://jinja.pocoo.org)
