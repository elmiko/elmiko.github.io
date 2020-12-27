---
layout: post
title: "Messing around with Nginx and Podman"
subtitle:  ""
date: 2020-12-27
categories:
---

For some time now I've wanted to become more familiar with
[load balancers](https://en.wikipedia.org/wiki/Load_balancing_(computing)). Mainly to help
my learning as I do some custom OpenShift installations, but also to fuel a dream of
building my own [simple container hosting](https://notes.elmiko.dev/2019/07/27/wch-005-simple-container-hosting.html)
workflow. Over the weekend I had a thought about using [Podman](https://podman.io) and
an [Nginx](https://nginx.com) container to experiment with balancing network traffic.

To start with I decided to create as simple an architecture as possible: 1 load balancer
in round robin mode feeding traffic to 2 servers. Each application deployed as a container.
The servers would be simple [echo-golem](https://gitlab.com/elmiko/echo-golem) deployments
that reflect body text back to the sender.

## Nginx configuration and network names

To make my Nginx configuration simple and also reslient to future change, I want to use
well known names instead of IP addresses for my echo-golem containers. To do that in the
wild I would use DNS tro server the proper IPs or if running on OpenShift, I would just
let the edge routers do all the work. But here, I need to give the server containers names
and I need those names to be meaningful in the network namespace.

I need to create a network that Podman will use to address the container by name. To do that
I use:
```
podman create network echogolemnet
```
When I create the container for this experiment I will use the `--network echogolemnet` to
ensure they are all placed in the same network space.

Now that I have a network namespace to keep track of my servers I will use the arbitrary names
"echogolem1" and "echogolem2" for them. This allows me to create an Nginx configuration like
this:

```
events {}
http {
    upstream echogolem {
        server echogolem1:8080;
        server echogolem2:8080;
    }

    server {
        listen 8080;

        location / {
            proxy_pass http://echogolem;
        }
    }
}
```
which I save in a file named `nginx.conf`.

One thing to note are the ports. I needed to keep these straight as I plumbed the traffic through
to the servers. I could have used anything at the server listen port though, this is useful to
keep in mind for moving the Nginx container around.

## Starting the experiment

I need to start the echo-golem servers first otherwise Nginx will crash when it tries to connect
to the upstream servers. To start them I use the following commands:
```
podman run --rm -d --name echogolem1 --network echogolemnet quay.io/elmiko/echo-golem:python-flask
podman run --rm -d --name echogolem2 --network echogolemnet quay.io/elmiko/echo-golem:python-flask
```
then check their status with a quick `podman ps`.
```
$ podman ps --filter name=echogolem*
CONTAINER ID  IMAGE                                   COMMAND               CREATED        STATUS            PORTS   NAMES
e11ebe415c59  quay.io/elmiko/echo-golem:python-flask  /bin/sh -c /usr/l...  2 minutes ago  Up 2 minutes ago          echogolem2
9f88bdf1eb2b  quay.io/elmiko/echo-golem:python-flask  /bin/sh -c /usr/l...  2 minutes ago  Up 2 minutes ago          echogolem1
```

It's worth noting that I've started these containers with `-d` and `--rm`, so they will detach from
the terminal and be removed when they end, respectively.

Now I start the Nginx container with:
```
podman run --rm -it -v `pwd`/nginx.conf:/etc/nginx/nginx.conf:Z -p 8080:8080 --network echogolemnet docker.io/library/nginx
```
this time I'm letting the container stay attached to the terminal so I can watch its output.
I also attach a volume to the `nginx.conf` file that I created earlier, publish a port to the host on `8080`,
and connect the container to the `echogolemnet` network.

After starting, I see this output:
```
$ podman run --rm -it -v `pwd`/nginx.conf:/etc/nginx/nginx.cong:Z -p 8080:8080 --network echogolemnet docker.io/library/nginx
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
10-listen-on-ipv6-by-default.sh: Getting the checksum of /etc/nginx/conf.d/default.conf
10-listen-on-ipv6-by-default.sh: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
/docker-entrypoint.sh: Configuration complete; ready for start up
```

## Sending messages and watching traffic

Now comes the fun. I will use the [HTTPie](https://httpie.io/) project to make some quick
calls to the load balancer. If it is truly doing a round robin, then I should see the first
request in one of the echo-golem's logs and then the second request in the other's.

### Send first message
```
$ http localhost:8080 foo=bar
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 15
Content-Type: text/html; charset=utf-8
Date: Sun, 27 Dec 2020 17:31:50 GMT
Server: nginx/1.19.5

{
        "foo": "bar"
}
```

**Nginx log**
```
127.0.0.1 - - [27/Dec/2020:17:31:50 +0000] "POST / HTTP/1.1" 200 15 "-" "HTTPie/1.0.3"
```

**echogolem1 logs**
```
$ podman logs echogolem1
---> Running application from Python script (app.py) ...
 * Serving Flask app "app" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:8080/ (Press CTRL+C to quit)
10.88.2.6 - - [27/Dec/2020 17:31:50] "POST / HTTP/1.0" 200 -
```

**echogolem2 logs**
```
$ podman logs echogolem2
---> Running application from Python script (app.py) ...
 * Serving Flask app "app" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:8080/ (Press CTRL+C to quit)
```

So far, so good. The request has only gone to echogolem1.

### Send second message
```
$ http localhost:8080 foo=bar
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 15
Content-Type: text/html; charset=utf-8
Date: Sun, 27 Dec 2020 17:37:29 GMT
Server: nginx/1.19.5

{
        "foo": "bar"
}
```

**Nginx log**
```
127.0.0.1 - - [27/Dec/2020:17:31:50 +0000] "POST / HTTP/1.1" 200 15 "-" "HTTPie/1.0.3"
127.0.0.1 - - [27/Dec/2020:17:37:29 +0000] "POST / HTTP/1.1" 200 15 "-" "HTTPie/1.0.3"
```

**echogolem1 logs**
```
$ podman logs echogolem1
---> Running application from Python script (app.py) ...
 * Serving Flask app "app" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:8080/ (Press CTRL+C to quit)
10.88.2.6 - - [27/Dec/2020 17:31:50] "POST / HTTP/1.0" 200 -
```

**echogolem2 logs**
```
$ podman logs echogolem2
---> Running application from Python script (app.py) ...
 * Serving Flask app "app" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:8080/ (Press CTRL+C to quit)
10.88.2.6 - - [27/Dec/2020 17:37:29] "POST / HTTP/1.0" 200 -
```

And there we have it. Fairly definitive proof of how the round robin works.

## Wrap up

I know this is a super basic intro to how this works, but I tend to learn best by
taking apart the small pieces and playing with them to understand how to build
bigger things. I credit that to a youth spent playing with Legos ;)

The next things I want to do with this knowledge is setup an external DNS to provide
name service for the API and application endpoints for an OpenShift cluster. Then
setup a load balancer in a virtual machine that will balance the traffic between the
nodes I am deploying. It _should_ be straightforward, but you never know lol.

I am also going to mess around with deploying a virtual machine that I can use to
start experimenting on my container hosting workflow. Ideally, if I can get it working
I could start testing how much it takes to run a server like that. Anyways, dreams for
another day, as always happy hacking! =)
