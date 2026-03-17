---
title: Async/Await in C#
pubDatetime: 2026-03-17T03:15:05.412Z
tags:
  - TIL (TodayILearned)
  - C#
description:
  Today I learned how async & await really work in C#.
---

## Table of contents

For a long time, I treated `async` and `await` as black-box magic spells. I knew how to use them, but I believe that to use a tool effectively, you need to understand how it works under the hood.
Today I learned how `async` & `await` really work in C#.

## What are `async` & `await`?

`async` and `await` are keywords in C# that enable asynchronous programming. `async` is used in a method signature to specify that the method contains asynchronous operations, while `await` is used to pause the execution of that method until a specific background task completes.

Let's say we have a class that loads user data from a service. The synchronous version might look like this:

```csharp
public class UserLoader
{
    private IEnumerable<User> _users = new List<User>();

    public void LoadUserData()
    {
        // Execution blocks here until the data is fully loaded
        _users = UserService.GetUserData();
    }
}
```

To make this method asynchronous, we can use `async` and `await` like this:

```csharp
public class UserLoader
{
    private IEnumerable<User> _users = new List<User>();

    public async Task LoadUserDataAsync()
    {
        // Execution yields to the caller until the data is loaded
        _users = await UserService.GetUserDataAsync();
    }
}
```

As you can see, the asynchronous version looks almost identical to the synchronous version.

However, under the hood, they work very differently. Before we dive into those details, let's look at why we would want to use this pattern in the first place.

## Why use `async` & `await`?

Asynchronous programming allows your application to perform non-blocking operations. This drastically improves both responsiveness and scalability.

Imagine the code above is part of a Blazor web app. If we use the synchronous `LoadUserData`, the UI thread will freeze until the data finishes downloading, leading to a terrible user experience. By using the asynchronous version, the UI thread is freed up to be responsive while the data loads in the background.

On the  backend, asynchronous code makes your APIs much more scalable. When a web server makes an I/O request (like a database query or an HTTP call), an asynchronous method does not block a thread while waiting for the network response. Instead, it releases the thread back to the thread pool to handle other incoming HTTP requests.

Overall, `async` and `await` lead to better resource management for I/O-bound operations.

## `async` & `await` are syntactic sugar

The biggest "aha" moment for me was realizing that when you compile your `async` code, the C# compiler transforms your method into a complex state machine.

Let's say you have this simple `async` method:

```csharp
using System.Threading.Tasks;

public class MyClass
{
    public async Task DoWorkAsync()
    {
        await Task.Delay(1000);
    }
}
```

When you compile this code, the compiler generates a hidden `struct` that implements `IAsyncStateMachine`. It looks roughly like this simplified version:

```csharp
public class MyClass
{
    [CompilerGenerated]
    private struct <DoWorkAsync>d__0 : IAsyncStateMachine
    {
        public int <>1__state;
        public AsyncTaskMethodBuilder <>t__builder;
        private TaskAwaiter <>u__1;

        private void MoveNext()
        {
            int num = <>1__state;
            try
            {
                TaskAwaiter awaiter;
                if (num != 0)
                {
                    awaiter = Task.Delay(1000).GetAwaiter();
                    if (!awaiter.IsCompleted)
                    {
                        num = (<>1__state = 0);
                        <>u__1 = awaiter;
                        <>t__builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);
                        return;
                    }
                }
                else
                {
                    awaiter = <>u__1;
                    <>u__1 = default(TaskAwaiter);
                    num = (<>1__state = -1);
                }
                awaiter.GetResult();
            }
            catch (Exception exception)
            {
                <>1__state = -2;
                <>t__builder.SetException(exception);
                return;
            }
            <>1__state = -2;
            <>t__builder.SetResult();
        }
    }

    public Task DoWorkAsync()
    {
        <DoWorkAsync>d__0 stateMachine = default(<DoWorkAsync>d__0);
        stateMachine.<>t__builder = AsyncTaskMethodBuilder.Create();
        stateMachine.<>1__state = -1;
        stateMachine.<>t__builder.Start(ref stateMachine);
        return stateMachine.<>t__builder.Task;
    }
}
```

The `MoveNext` method is where the actual logic lives. It uses a state variable (`<>1__state`) to keep track of where it is in the execution flow.

Notice that when you call `DoWorkAsync`, the[`AsyncTaskMethodBuilder.Start` method](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.asynctaskmethodbuilder.start?view=net-10.0) is invoked. This, in turn, calls the `MoveNext` method to begin executing the state machine.

The `await` keyword is compiled into a `TaskAwaiter` and a check for completion. If the task is not yet finished, the state machine sets up to resume upon completion by calling `AwaitUnsafeOnCompleted`.

The [`AsyncTaskMethodBuilder.AwaitUnsafeOnCompleted` method](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.asynctaskmethodbuilder.awaitunsafeoncompleted?view=net-10.0) is where the magic happens. Simply put, this method registers the state machine's `MoveNext()` as a callback to be executed the moment the awaited task completes. This allows the state machine to seamlessly resume execution right where it left off.

Note that the thread that executes the second `MoveNext` method is not necessarily the same thread that started the `async` method.

Understanding this state machine makes it much easier to see what happens when things go wrong—like when you forget to use the `await` keyword.

## You have to `await` a `Task`
What happens if you call an `async` method but forget to `await` it? Let's look at a dangerous example:

```csharp
using System;
using System.Threading.Tasks;
					
public class Program
{
    public static async Task Main()
    {
        try
        {
            ThrowErrorAsync(); // Oops, forgot to await!
            
            Console.WriteLine("Success!");
        }
        catch (Exception)
        {
            Console.WriteLine("Exception!");
        }
    }

    public static async Task ThrowErrorAsync()
    {
        await Task.Delay(100);
        // Oh no... database crashed!
        throw new InvalidOperationException();
    }
}
```

What do you think the output will be?

It will print "Success!".

Because `ThrowErrorAsync` is not awaited, the Main method fires off the task and immediately continues to the next line without waiting for it to finish. But why doesn't the catch block catch the exception when it finally throws 100 milliseconds later?

Let's take a closer look at the generated state machine for this code:

```csharp
public class Program
{
    [CompilerGenerated]
    private struct <Main>d__0 : IAsyncStateMachine
    {
        public int <>1__state;
        public AsyncTaskMethodBuilder <>t__builder;
        // No awaiter here since we forgot to await
        /*
        private TaskAwaiter <>u__1;
        */

        private void MoveNext()
        {
            try
            {
                try
                {
                    // This is what the compiler would have generated 
                    // for awaiting the ThrowErrorAsync.
                    /*
                    TaskAwaiter awaiter;
                    if (num != 0)
                    {
                        awaiter = ThrowErrorAsync().GetAwaiter();
                        if (!awaiter.IsCompleted)
                        {
                            num = (<>1__state = 0);
                            <>u__1 = awaiter;
                            <>t__builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);
                            return;
                        }
                    }
                    else
                    {
                        awaiter = <>u__1;
                        <>u__1 = default(TaskAwaiter);
                        num = (<>1__state = -1);
                    }
                    awaiter.GetResult();
                    */
                    ThrowErrorAsync();
                    Console.WriteLine("Success!");
                }
                catch (Exception)
                {
                    Console.WriteLine("Exception!");
                }
            }
            catch (Exception exception)
            {
                <>1__state = -2;
                <>t__builder.SetException(exception);
                return;
            }
            <>1__state = -2;
            <>t__builder.SetResult();
        }
    }

    public static Task Main()
    {
        <Main>d__0 stateMachine = default(<Main>d__0);
        stateMachine.<>t__builder = AsyncTaskMethodBuilder.Create();
        stateMachine.<>1__state = -1;
        stateMachine.<>t__builder.Start(ref stateMachine);
        return stateMachine.<>t__builder.Task;
    }
}
```

The [`TaskAwaiter.GetResult` method](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.taskawaiter.getresult?view=net-10.0) re-throws any exceptions that occurred during the asynchronous operation. In our case, since we forgot to `await` the `ThrowErrorAsync` method, the exception is quietly swallowed, missing the opportunity to be caught by our `catch` block.

## Asynchronous code is contagious
One final thing to note is a concept often called "Async all the way down."

If any part of your method uses `await`, the method itself must be marked `async` and return a `Task`. This means the method calling your method must also `await` it, becoming `async` itself. This creates a chain reaction all the way up to your application's entry point.

You might be tempted to break this chain by calling `.Result` or `.Wait()` on a `Task` to force it to run synchronously. Don't do this. Forcing a sync-over-async call blocks the calling thread while waiting for the `async` background thread to finish. This can lead to thread pool starvation or application deadlocks.

Remember that the thread pool has only a finite number of threads. If all threads are blocked by the `Task.Wait()` calls, then no threads are available to execute the background tasks, resulting in a deadlock.

The best practice is to embrace the contagion. If you go async, go async all the way down.

## Conclusion
`async` and `await` are powerful tools for writing responsive, scalable C# applications without the headache of manual thread management. While they make asynchronous code read like synchronous code, keep it mind that the compiler is building a state machine behind the scenes. Always `await` your tasks to ensure exceptions are routed and handled correctly, and never force asynchronous code to run synchronously to avoid thread pool starvation and deadlocks.

## References
- https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/