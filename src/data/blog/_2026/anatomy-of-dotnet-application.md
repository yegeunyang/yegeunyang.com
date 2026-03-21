---
title: Anatomy of a .NET Application
pubDatetime: 2026-03-21T23:12:16.166Z
modDatetime: 2026-03-21T23:42:25.134Z
tags:
  - TIL (TodayILearned)
  - C#
description:
  Today I learned how .NET applications are structured, exploring the dotnet CLI, project files, top-level statements, and the inner workings of the Generic Host.
---

## Table of contents

## Introduction

Creating and running a new .NET application could be as simple as clicking a few buttons in  Visual Studio but have you ever wondered what happens behind the scenes? 
Today I learned how .NET applications are structured, exploring the dotnet CLI, project files, top-level statements, and the inner workings of the Generic Host.

## The `dotnet` command
The `dotnet` command is the primary tool for creating, building, and running .NET applications. You can use it to create new projects, add packages, build your application, and run it.

While Visual Studio provides a graphical interface for these tasks, using the `dotnet` command in the terminal helps you better understand the underlying processes.

You can use `--help` option to see all the available commands and options:

```bash
dotnet --help
```

The following commands set up a solution with a Blazor UI, an application layer, an infrastructure layer, and a test project:

```bash
# 1. Create a blank solution
dotnet new sln --name MyApp

# 2. Create the projects
dotnet new blazor --name MyApp.UI
dotnet new classlib --name MyApp.Application
dotnet new classlib --name MyApp.Infrastructure
dotnet new xunit --name MyApp.Tests

# 3. Add the projects to the solution
dotnet sln add MyApp.UI/MyApp.UI.csproj
dotnet sln add MyApp.Application/MyApp.Application.csproj
dotnet sln add MyApp.Infrastructure/MyApp.Infrastructure.csproj
dotnet sln add MyApp.Tests/MyApp.Tests.csproj

# 4. Add project references
dotnet add MyApp.Infrastructure/MyApp.Infrastructure.csproj reference MyApp.Application/MyApp.Application.csproj
dotnet add MyApp.UI/MyApp.UI.csproj reference MyApp.Application/MyApp.Application.csproj
dotnet add MyApp.UI/MyApp.UI.csproj reference MyApp.Infrastructure/MyApp.Infrastructure.csproj
dotnet add MyApp.Tests/MyApp.Tests.csproj reference MyApp.Application/MyApp.Application.csproj

# 5. Build the solution
dotnet build

# 6. Run the application
dotnet run --project MyApp.UI/MyApp.UI.csproj

# 7. Run the tests
dotnet test
```

Creating a new project with templates is a great way to get started, now let's take a closer look at how they are structured and what files are included by default.

But before we dive into the details, note that there is a new feature called file-based applications, which allows you to write your code in a single file without needing to create a project.

## File-based vs. Project-based apps

Starting with C# 14 and .NET 10, there are two ways to structure your C# applications: file-based and project-based. In a file-based application, you can write all your code in a single file, and the compiler will automatically generate the necessary boilerplate code for you. In a project-based application, you have a more traditional structure with multiple files and folders.

This is an exmple of a file-based application:

```csharp
Console.WriteLine("Hello, World!");
```

Save the above code in a file named `MyApp.cs` and run the following command in the terminal:

```bash
dotnet run MyApp.cs
```

You will see the output "Hello, World!" without needing to write any additional code.

File-based apps are great for small scripts, while project-based apps are better suited for larger applications with more complex structures.

In the rest of this post, I will focus on the traditional project-based structure, which is more common in real-world applications.

## The `slnx` file and the `csproj` files
When you create a new solution, you are essentially creating a container for one or more related projects. The solution file (.slnx) is a file that contains metadata.

Inside that solution, each project has a .csproj file. It is an XML doucument that contains all the information MSBuild needs to build youp project including:
- The project SDK version (e.g., Microsoft.NET.Sdk.Web for a Blazor app)
- The target framework (e.g., .NET 10, .NET Standard 2.1)
- External dependencies via `PackageReference` (your NuGet packages)
- Internal dependencies via `ProjectReference`

The project SDK dictates how your project is compiled and published depending on your specific project type. For example, class library projects use `Microsoft.NET.Sdk`, while web projects use `Microsoft.NET.Sdk.Web`, which includes additional tooling for things like Razor compilation and HTTP request handling.

The target framework specifies the set of APIs available to your project. For example, if you target .NET 10, you can take advantage of all the latest features and libraries available in that version. If you target older frameworks, you are limited to a smaller set of APIs but gain more compatibility with older environments.

## The `appsettings.json` file
The `appsettings.json` file is the default file for configuration. It holds JSON key-value pairs for things like database connection strings, logging verbosity, and third-party API keys.

## The `Program.cs` file
The `Program.cs` file contains the `Main` method, which is the entry point of the application. But most of the time, you won't see a `Main` method in this file because of a feature called top-level statements, which was introduced in C# 9. This allows you to write code without needing to wrap it in a class and a method.

Let's say you have the following code in `Program.cs`:

```csharp
if (args.Length == 0)
{
    Console.WriteLine("Please provide at least one argument.");
    return;
}
```

The compiler will automatically generate the following code behind the scenes:

```csharp
[CompilerGenerated]
internal class Program
{
    private static void <Main>$(string[] args)
    {
        if (args.Length == 0)
        {
            Console.WriteLine("Please provide at least one argument.");
        }
    }
}
```

Note that you can use the `args` variable and the `await` keyword without needing to do anything.

This is cool, but for a modern .NET application, the `Program.cs` file does more than just being the entry point.

## The Generic Host
If you open a `Program.cs` in an ASP.NET Core project, you will almost always see code that looks like this:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Omitted for brevity

var app = builder.Build();

// Omitted for brevity

app.Run();
```

This is the Generic Host in action. It abstracts away the complex infrastructure required to manage the app lifetime (startup and shutdown) and breaks it down into three main phases:
- The Builder Configuration Phase: Before the application is built, you configure its environment. Here you register your application's dependencies into the built-in Dependency Injection (DI) container (`builder.Services`). You also configure logging providers and load configuration data from `appsettings.json`.
- The App Configuration Phase: Once `builder.Build()` is called, the application instance is created. Here, you configure the middleware pipelines.
- The Run Phase: Finally, `app.Run()` starts your bootstrapped application and terminates it gracefully when the application stops or crashes.

The `WebApplication.CreateBuilder(args)` returns a `WebApplicationBuilder` instance, which implements the [`IHostApplicationBuilder`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostapplicationbuilder?view=net-10.0-pp) interface. It has the following important properties:
- `Services`: This is the DI container where you register your application's services and dependencies. This property holds an [`IServiceCollection`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.iservicecollection?view=net-10.0-pp) instance.
- `Configuration`: This is where you can access configuration settings from `appsettings.json` and other sources. This property holds an [`IConfigurationManager`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.configuration.iconfigurationmanager?view=net-10.0-pp) instance.

The following is an example of how to use these properties:

```csharp
// adding a service to the DI container
builder.Services.AddScoped<IMyService, MyService>();

// adding a DbContextFactory using the connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContextFactory<MyDbContext>(options =>
    options.UseSqlServer(connectionString));
```

## Why is it called generic?
But if it's called the Generic Host, why do we use `WebApplication.CreateBuilder()` instead of something like `GenericHost.CreateBuilder()`?

The Generic Host is designed to be agnostic of the application type. The `WebApplication.CreateBuilder()` method is a convenient method that sets up the Generic Host with defaults that are suitable for web applications.

This is an example of using the Generic Host for a .NET Worker Service:

```csharp
using Example.WorkerService;

// HostApplicationBuilder also implements IHostApplicationBuilder
HostApplicationBuilder builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();

var app = builder.Build();

app.Run();
```

## Why is the Generic Host important?
The Generic Host is a fundamental building block in modern .NET development because it provides a standardized way to configure and run apps. By unifying these concepts under the Generic Host, Microsoft ensured that once you learn how to configure Dependency Injection, Logging, and Configuration for a web app, you know exactly how to do it for a background worker service, a Console app, or a cloud-native microservice.

## Conclusion
Creating a new .NET application is easy but keep in mind that there is a lot happening behind the scenes. Understanding the anatomy of a .NET application helps you better understand how the different pieces fit together and how to leverage the powerful, essential features of the .NET ecosystem such as the `dotnet` CLI, project files, top-level statements, and the Generic Host.

## References
- https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet
- https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/
- https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host?tabs=appbuilder