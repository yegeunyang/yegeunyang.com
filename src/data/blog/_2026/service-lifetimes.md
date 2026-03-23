---
title: Service Lifetimes in C#
pubDatetime: 2026-03-22T19:53:05.752Z
modDatetime: 2026-03-22T22:47:01.032Z
tags:
  - Lab
  - C#
description:
  Test your knowledge with this quick lab about service lifetimes in C#.
---

## Note
- In Blazor Server applications, [multiple threads could be used to handle requests from the same client connection](https://blazor-university.com/components/multi-threaded-rendering/). This can cause problems when using a service that is not thread-safe, such as the `DbContext`.

- [`IServiceCollection`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.iservicecollection?view=net-10.0-pp) is a container for services.
- [`IServiceProvider`](https://learn.microsoft.com/en-us/dotnet/api/system.iserviceprovider?view=net-10.0) is built from the `IServiceCollection` and is used to inject the services.

- There are actually 2 different `IServiceProvider` instances. One is called the **root** service provider, which is created when the application starts and is used to resolve singleton services. The other is called the **scoped** service provider, which is created for each request scope and is used to resolve scoped services. If a child provider is asked for a `Singleton` or a `Transient` services, it delegates the request to the root provider.

- A scope is created with `using var scope = rootServiceProvider.CreateScope()`. You can resolve services from the scoped service provider by `scope.ServiceProvider.GetRequiredService<T>()`. Note that you must use `using var` to dispose of the scope when you are done with it.

- ASP.NET Core API applications behind the scenes create a new scope for each incoming HTTP request.

## Quiz
<details style="margin-bottom: 1rem; width: 100%;">
<summary>What are the three main service lifetimes in C# and how do they differ?</summary>

1. **Transient**: A new instance is created each time the service is requested.
2. **Scoped**: An instance is created once per request scope.
3. **Singleton**: Only one instance of the service is created the first time it is requested, and it is shared throughout the application's lifetime.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>What is the "Scope" of a service for ASP.NET Core API and Blazor Server applications?</summary>

- In an ASP.NET Core API application, the scope is typically **per HTTP request**. This means that a new instance of a scoped service is created for each incoming HTTP request and is shared within that request.
- In a Blazor Server application, the scope is **per connection**. This means that a new instance of a scoped service is created for each client connection and is shared within that connection.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>When you call builder.Services.AddDbContext in ASP.NET Core, what is the default service lifetime for the DbContext?</summary>

- The default service lifetime for the DbContext is **Scoped**. This means that a new instance of the DbContext is created for each request scope (typically per HTTP request in an API application or per client connection in a Blazor Server application).

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Why should we use the DbContextFactory instead of directly injecting the DbContext for Blazor Server applications? And what are some things that you should be aware of when using it?</summary>

- In Blazor Server applications, the scope is per connection, which means that if you inject the `DbContext` directly, it will be shared across all requests from that connection. **The `DbContext` is not thread-safe**, and is designed to be short-lived. If you do try to use the same `DbContext` instance, you may encounter an `InvalidOperationException`.
- When using the `DbContextFactory`, you should be aware that the `DbContextFactory` itself is a singleton service and managed by the DI container, however the `DbContext` instances it creates are not managed by the DI container. Therefore, you should use `using var` to **dispose of them**.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>What is the golden rule for service scope validation?</summary>

- The golden rule for service scope validation is: **A service can only depend on services with a lifetime that is equal to or longer than its own lifetime**. This means that:
  - Transient services can depend on transient, scoped, or singleton services.
  - Scoped services can depend on scoped or singleton services, but not transient services.
  - Singleton services can only depend on singleton services.
- For example, imagine you have a singleton service that requires `DbContext` (which is scoped) in its constructor. The DI container will inject the `DbContext` instance into the singleton service when it is created. However, since the singleton service is created only once and shared throughout the application's lifetime, it will hold onto that same `DbContext` instance. This can lead to critical issues.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Why is injecting IServiceProvider directly not recommended?</summary>

- Injecting `IServiceProvider` directly is not recommended because it hides your true dependency. It also makes unit testing difficult. Lastly, if you forget to register a service, you won't get an error until you try to resolve it at runtime, which can lead to runtime errors.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>When you inject IServiceProvider in a constructor, which kind of IServiceProvider are you getting?</summary>

- It dependes on the service that is requesting the `IServiceProvider`. If a singleton service is requesting the `IServiceProvider`, it will get the root service provider. If a scoped service is requesting the `IServiceProvider`, it will get the scoped service provider.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Are background services singletons? Why should they be?</summary>

- Background services should be singletons because they are designed to run for the entire lifetime of the application. Imagine they are `Transient`, you have no way to stop them gracefully when the application shuts down.
- Note that the `AddHostedService()` extension method is just a thin wrapper around `AddSingleton()`.
</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>When should you use IServiceScopeFactory? What problem does it solve?</summary>

- You cannot use `Scoped` services in a `Singleton` service. However, sometimes you may want to use `Scoped` services in a `Singleton` service. For example, you may want to use `DbContext` in a `Singleton` service. In this case, you can use `IServiceScopeFactory` to create a new scope and resolve the `DbContext` from that scope.
- Use `using var scope = _serviceScopeFactory.CreateScope()` and `scope.ServiceProvider.GetRequiredService<DbContext>()` to resolve the `DbContext` from the new scope. Note that the `IServiceScopeFactory` itself is a singleton service and managed by the DI container, however you must dispose of the scope when you are done with the services resolved from it.

</details>

## Exercise
Run the following code and check if the output is what you expected.
<iframe width="100%" height="475" src="https://dotnetfiddle.net/Widget/Yj53Pq" frameborder="0"></iframe>

## References
- https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-10.0
- https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/