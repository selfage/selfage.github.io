# Selfage

## NPM packages

@selfage features a [package family published on NPM](https://www.npmjs.com/search?q=%40selfage), focusing on web app and service development using TypeScript, based on popular tools such as [browserify](https://www.npmjs.com/package/browserify), [uglify-js](https://www.npmjs.com/package/uglify-js), [prettier](https://www.npmjs.com/package/prettier), and [express](https://www.npmjs.com/package/express).

### Design principle

@selfage packages stress on static analysis, such as type-safe APIs and metaprogramming. Runtime tests are harder to maintain comparing to static analysis/checks.

Additionally for web apps, unlike React or Angular, @selfage packages antipate code to be written only in TypeScript. HTML and CSS are used via browser APIs, e.g., `appendChild()` or `setAttribute()`.

### Guides

Each package has its own documentation and it's fairly standalone, i.e. it's not closely coupled with other @selfage packages. Therefore you can only use what you need from @selfage packages without worrying about introducing the entire package family.

However, it could be hard to find what you need. For each topic listed below, we will point you to either a guide that introduces several packages working together, or a document for a single package that achieves the goal.

* Web app
  * [Serve a "hello world" app](/serve_web_app)
  * [Design web components](/design_web_components)
  * [Import assets](/import_assets)
  * [Track state in browser history](https://www.npmjs.com/package/@selfage/stateful_navigator)
  * [Testing in browser](/testing_in_browser)
* Web service
  * [Build a micro service](/build_micro_service)
  * [Talk to Google Cloud Datastore](https://www.npmjs.com/package/@selfage/datastore_client)

## How to write clean code

Selfage features a series of guides on how to write clean code, with some quizs at the end of each tutorial.

* [Dependency injection]
* [3 patterns to reuse code]
* [Fewer if statements]
* [Verbose coding, cleaner reading]
