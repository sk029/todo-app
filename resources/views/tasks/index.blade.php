<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link rel="stylesheet" href="{{ asset('css/tasks.css') }}">
    <script src="{{ asset('js/tasks.js') }}" defer></script>
</head>
<body>
    <main class="container">
        <header>
            <h1>My tasks</h1>
            <p>A simple place to keep track of things to do.</p>
        </header>

        <section class="panel" aria-labelledby="add-task-heading">
            <h2 id="add-task-heading">Add a task</h2>
            <p id="task-message" role="status" aria-live="polite" hidden></p>
            <form id="task-form">
                <label for="task-title">Task title</label>
                <div class="form-row">
                    <input id="task-title" name="title" type="text" maxlength="255"
                        placeholder="What do you need to do?" required>
                    <button type="submit" disabled>Add task</button>
                    <button id="cancel-edit" type="button" class="secondary" hidden>Cancel</button>
                </div>
            </form>
            <noscript><p>Please enable JavaScript to manage your tasks.</p></noscript>
        </section>

        <section class="panel" aria-labelledby="task-list-heading">
            <div class="list-heading">
                <h2 id="task-list-heading">Task list</h2>
                <span id="task-count">{{ $tasks->count() }} {{ Str::plural('task', $tasks->count()) }}</span>
            </div>

            <ul id="task-list" class="task-list">
                @forelse ($tasks as $task)
                    <li class="task-row {{ $task->is_completed ? 'completed' : '' }}" data-task-id="{{ $task->id }}">
                        <div class="task-details">
                            <input type="checkbox" id="task-{{ $task->id }}"
                                @checked($task->is_completed) disabled>
                            <label for="task-{{ $task->id }}">{{ $task->title }}</label>
                        </div>
                        <div class="task-actions">
                            <button type="button" class="secondary" data-action="edit" disabled>Edit</button>
                            <button type="button" class="delete" data-action="delete" disabled>Delete</button>
                        </div>
                    </li>
                @empty
                    <li class="empty-state">No tasks yet. Add your first task above.</li>
                @endforelse
            </ul>
        </section>
    </main>
</body>
</html>
