# Annotation Client for the LDOW2016 Pingback Feedback
**using feedback protocol on linked data**

JavaScript/HTML component, which have to be included in a website for RDF browsing like [DBpedia](http://dbpedia.org/).
Enables the user to create comment resources as plain comments or patches of the current resource.

## Requirements
* Browser with ECMA2015 support
* JQuery in version 1.9.1 and higher (if jQuery is not available it will be requested by the script)
* link to the original resource as : <link rel="alternate" type="application/json" href="..." />
* link to a ResourceHostingService by as: <link rel="resourcehostingservice" href="..." />
* link to a PingbackService by including: <link rel="pingbackservice" href="..." />
* RESTful access or content negotiation to RDF Formats like application/rdf+json to the linked resource, e.g. http://de.dbpedia.org/page/Leipzig?output=application%2Frdf%2Bjson for Leipzig

## Installation
Include FBA.js into your homepage.
Check for fallback URLs in FBA.js to match your domain.

### Greasemonkey
If you want to install this app as [Greasemonkey](http://greasespot.net/) ([plugin](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)) user script, just point your browser to the location of `FBE.user.js` in your local file system. (Be aware of the “side effects”!)

## Side effects
We include Bootstrap asynchronously, so take care of your CSS class names.



The work was done as part of [AKSW](aksw.org).
