---
layout: post
title:  "Adding a simple request logger to a go-swagger project"
date:   2016-07-11
categories:
---

Recently I have been creating some small HTTP REST applications. To
accelerate the process I am using a combination of APIs designed with the
[OpenAPI Specification](https://openapis.org/) and
generated framework [Go code](https://golang.org) from the
[go-swagger toolkit](http://goswagger.io/). So far, this
process has been relatively painless and fruitful for prototyping an array
of RESTful application types.

The go-swagger toolkit creates server and client code from an OpenAPI
defined interface specified in a text file (or files). Once complete, you
are left with project that has a skeleton HTTP server and/or client. With a
little build magic this is easily turned into a binary ready for deployment.

Most of the functionality for the route handlers is fairly easy to get at,
and extending those handlers is similarly so. In addition to the handlers,
there are also exposed methods for adding command line flags, running specific
startup or shutdown code, and changing the HTTP pipeline by adding middleware.
All these extension points are available in a file that will not get
re-written on subsequent regenerations of the source code.

One of the things that I often want to see, at least at a debug level, in the
HTTP applications I am working on is a log of the requests and responses that
are happening. The default go-swagger server application does not do this, but
they do leave a few functions available for adding middleware to the HTTP
pipeline.

After creating the server source files, in the file named
`restapi/configure_{project name}.go`, you will find all the customizable
functions. In specific, the two we are interested in are:

```
func setupMiddlewares(handler http.Handler) http.Handler {
	return handler
}

func setupGlobalMiddleware(handler http.Handler) http.Handler {
	return handler
}
```

These functions are our entry point to changing the behavior of all HTTP
requests and responses that occur in our application. The `setupMiddlewares`
function allows us to change the calls for the routes we have added to the
program, whereas the `setupGlobalMiddleware` function allows us to access
all calls made(including to `/swagger.json`).

For today's purposes I only want to add some simple logging, and to do that
I will add a function using the
[decorator pattern](https://en.wikipedia.org/wiki/Decorator_pattern)
to give us a handler that will log incoming requests and then call the
original HTTP handler.

```
func addLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("received request:", r.Method, r.URL)
		next.ServeHTTP(w, r)
	})
}
```

Let's break this down quickly. The `http.Handler` interface defines a
`ServeHTTP` method as its sole function. The `http.HandlerFunc` type will
allow us to easily convert a function declaration into an object of type
`http.Handler`. The function we define here will first print a line, through
the standard logging package, that will display the HTTP request method and
URL. After printing the log, it well then call the `ServerHTTP` method for
the `next http.Handler` that was passed during creation of the decorator. In
this manner, we are returning a function that will get called as the
`http.Handler` in place of the original, and then it will call the original
to preserve the behavior.

To put this function to use, I now need to add it to my global middleware
setup:

```
func setupGlobalMiddleware(handler http.Handler) http.Handler {
	return addLogging(handler)
}
```

With this in place, I try a quick test run on the command line:

```
$ ./testswags-server --port 42000
2016/07/11 20:24:57 Serving testswags at http://127.0.0.1:42000
2016/07/11 20:25:11 received request: GET /
```

We can see that after launch, our application has printed a statement
recognizing the request that came in at the URI `/`. Great! our basic
logger is now working. Next steps I might take with this pattern could be
to add a reponse code log line, or some sort of request identification
mechanics. Once you start adding to the middleware in this manner, the sky's
the limit with regards to the possibilities.
