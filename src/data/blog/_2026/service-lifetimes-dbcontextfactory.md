---
title: Service Lifetimes and DbContextFactory in C#
pubDatetime: 2026-03-22T19:53:05.752Z
tags:
  - Lab
  - C#
description:
  Test your knowledge with this quick lab about service lifetimes and DbContextFactory in C#.
---

## Note
In Blazor Server applications, [multiple threads could be used to handle requests from the same client connection](https://blazor-university.com/components/multi-threaded-rendering/). This can cause problems when using a service that is not thread-safe, such as the `DbContext`.

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

## References
- https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-10.0
- https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/