const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const submitButton = form.querySelector('[type="submit"]');
const cancelButton = document.querySelector('#cancel-edit');
const heading = document.querySelector('#add-task-heading');
const list = document.querySelector('#task-list');
const count = document.querySelector('#task-count');
const message = document.querySelector('#task-message');
let editingId = null;
let busy = false;

function showMessage(text = '', error = false) {
    message.textContent = text;
    message.hidden = !text;
    message.classList.toggle('error', error);
}

function setBusy(value) {
    busy = value;
    document.querySelectorAll('#task-form input, #task-form button, #task-list input, #task-list button')
        .forEach(control => { control.disabled = value; });
    form.setAttribute('aria-busy', String(value));
}

async function request(url, method, data) {
    const response = await fetch(url, {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: data === undefined ? undefined : JSON.stringify(data),
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const error = result.errors ? Object.values(result.errors).flat()[0] : null;
        throw new Error(error || result.message || 'Something went wrong. Please try again.');
    }

    return response.status === 204 ? null : response.json();
}

function resetForm() {
    editingId = null;
    form.reset();
    heading.textContent = 'Add a task';
    submitButton.textContent = 'Add task';
    cancelButton.hidden = true;
}

function updateCount() {
    const total = list.querySelectorAll('.task-row').length;
    count.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    list.querySelector('.empty-state')?.remove();

    if (total === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = 'No tasks yet. Add your first task above.';
        list.append(empty);
    }
}

function taskRow(task) {
    const row = document.createElement('li');
    row.className = 'task-row';
    row.classList.toggle('completed', task.is_completed);
    row.dataset.taskId = task.id;
    row.innerHTML = `
        <div class="task-details">
            <input type="checkbox">
            <label></label>
        </div>
        <div class="task-actions">
            <button type="button" class="secondary" data-action="edit">Edit</button>
            <button type="button" class="delete" data-action="delete">Delete</button>
        </div>`;
    const checkbox = row.querySelector('input');
    checkbox.id = `task-${task.id}`;
    checkbox.checked = task.is_completed;
    const label = row.querySelector('label');
    label.htmlFor = checkbox.id;
    label.textContent = task.title;
    return row;
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;

    const title = titleInput.value.trim();
    if (!title) {
        showMessage('Please enter a task title.', true);
        titleInput.focus();
        return;
    }

    const id = editingId;
    showMessage();
    setBusy(true);

    try {
        const task = await request(id ? `/api/tasks/${id}` : '/api/tasks', id ? 'PATCH' : 'POST', { title });
        if (id) {
            list.querySelector(`[data-task-id="${id}"]`).replaceWith(taskRow(task));
        } else {
            list.prepend(taskRow(task));
        }
        resetForm();
        updateCount();
        showMessage(id ? 'Task updated.' : 'Task added.');
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        setBusy(false);
        titleInput.focus();
    }
});

cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage();
    titleInput.focus();
});

list.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button || busy) return;

    const row = button.closest('.task-row');
    const id = row.dataset.taskId;
    if (button.dataset.action === 'edit') {
        editingId = id;
        titleInput.value = row.querySelector('label').textContent;
        heading.textContent = 'Edit task';
        submitButton.textContent = 'Save changes';
        cancelButton.hidden = false;
        showMessage();
        titleInput.focus();
        return;
    }

    if (!window.confirm('Delete this task?')) return;
    showMessage();
    setBusy(true);
    try {
        await request(`/api/tasks/${id}`, 'DELETE');
        row.remove();
        if (editingId === id) resetForm();
        updateCount();
        showMessage('Task deleted.');
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        setBusy(false);
    }
});

list.addEventListener('change', async event => {
    const checkbox = event.target;
    if (!checkbox.matches('input[type="checkbox"]') || busy) return;

    const row = checkbox.closest('.task-row');
    const completed = checkbox.checked;
    showMessage();
    setBusy(true);
    try {
        const task = await request(`/api/tasks/${row.dataset.taskId}`, 'PATCH', { is_completed: completed });
        checkbox.checked = task.is_completed;
        row.classList.toggle('completed', task.is_completed);
    } catch (error) {
        checkbox.checked = !completed;
        showMessage(error.message, true);
    } finally {
        setBusy(false);
    }
});

setBusy(false);
