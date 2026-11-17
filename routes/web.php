<?php

use App\Models\Task;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('tasks.index', [
        'tasks' => Task::orderByDesc('id')->get(),
    ]);
});
