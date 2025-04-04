document.addEventListener('DOMContentLoaded', () => {
    // ===== OVERVIEW =====
    // This is a Todo application built with vanilla JavaScript
    // It uses localStorage for data persistence and features task filtering,
    // editing, deletion, completion toggling, and counting of remaining tasks
    // The application follows a modular approach with separate functions 
    // for each responsibility, making the code easier to maintain

    // ===== DOM ELEMENTS =====
    // Grab all necessary elements from the DOM for manipulation
    const todoInput = document.querySelector('#todo-input');
    const addTaskBtn = document.querySelector('#add-task-btn');
    const todoList = document.querySelector('#todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.querySelector('#clear-completed');
    const itemsLeftSpan = document.querySelector('#items-left');
    
    // ===== STATE MANAGEMENT =====
    // Initialize tasks array from localStorage or empty array if none exists
    // This is the central data structure that holds all task information
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // ===== INITIALIZATION =====
    // Initialize the app by rendering tasks and setting up event listeners
    init();
    
    function init() {
        // Render existing tasks from localStorage on page load
        renderAllTasks();
        updateItemsCount();
        
        // ===== EVENT LISTENERS SETUP =====
        // Set up event listeners for adding tasks (button click and Enter key)
        addTaskBtn.addEventListener('click', addTask);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
        // Set up event listener for clearing completed tasks
        clearCompletedBtn.addEventListener('click', clearCompleted);
        
        // Set up filter buttons for showing all/active/completed tasks
        // Uses data attributes (data-filter) to determine which filter to apply
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Visual feedback - highlight active filter button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply the selected filter using the data-filter attribute
                applyFilter(btn.dataset.filter);
            });
        });
    }
    
    // ===== TASK CREATION =====
    // Function to add a new task to the list
    function addTask() {
        // Get and validate the input text
        const taskText = todoInput.value.trim();
        if (taskText === "") return; // Don't add empty tasks
        
        // Create a new task object with unique ID, text, completion status, and date
        const newTask = {
            id: Date.now(), // Using timestamp as a simple unique ID
            text: taskText,
            completed: false,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        };
        
        // Add task to the tasks array
        tasks.push(newTask);
        
        // Save to localStorage and update the UI
        saveTasks();
        renderTask(newTask);
        updateItemsCount();
        
        // Reset input field for better UX
        todoInput.value = "";
        todoInput.focus();
    }
    
    // ===== TASK RENDERING =====
    // Function to render a single task in the UI
    function renderTask(task) {
        // Create list item for the task
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = task.id; // Store task ID for later manipulation
        
        // Add completed class if task is already completed
        if (task.completed) {
            li.classList.add('completed');
        }
        
        // Set the HTML content of the task item
        // Including checkbox, task text, date, edit and delete buttons
        li.innerHTML = `
            <div class="checkbox${task.completed ? ' checked' : ''}"></div>
            <div class="todo-content">
                <span class="todo-text">${task.text}</span>
                <span class="date-created">Added: ${task.date}</span>
            </div>
            <div class="todo-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // ===== TASK INTERACTION HANDLERS =====
        // Set up event listener for toggling task completion
        const checkbox = li.querySelector('.checkbox');
        checkbox.addEventListener('click', () => {
            toggleTaskCompletion(task.id);
        });
        
        // Set up event listener for deleting task
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            deleteTask(task.id);
        });
        
        // Set up event listener for editing task
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            editTask(li, task);
        });
        
        // Add the task to the todo list
        todoList.appendChild(li);
    }
    
    // Function to render all tasks from the tasks array
    function renderAllTasks() {
        // Clear existing list to prevent duplicates
        todoList.innerHTML = '';
        
        // Show empty state message if no tasks exist
        if (tasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No tasks yet. Add a task to get started!';
            todoList.appendChild(emptyState);
            return;
        }
        
        // Render each task in the tasks array
        tasks.forEach(task => renderTask(task));
    }
    
    // ===== TASK OPERATIONS =====
    // Toggle task completion status
    function toggleTaskCompletion(id) {
        // Update task completion status in the tasks array
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.completed = !task.completed; // Toggle the completed status
            }
            return task;
        });
        
        // Update UI to reflect the changed status
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.classList.toggle('completed');
        taskElement.querySelector('.checkbox').classList.toggle('checked');
        
        // Save changes and update items count
        saveTasks();
        updateItemsCount();
    }
    
    // Delete a task
    function deleteTask(id) {
        // Remove task from tasks array
        tasks = tasks.filter(task => task.id !== id);
        
        // Remove from DOM with animation for better UX
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateX(30px)';
        
        // Wait for animation to complete before removing element
        setTimeout(() => {
            taskElement.remove();
            if (tasks.length === 0) renderAllTasks(); // Show empty state if needed
            updateItemsCount();
        }, 300);
        
        // Save changes to localStorage
        saveTasks();
    }
    
    // Edit task text
    function editTask(li, task) {
        const todoText = li.querySelector('.todo-text');
        const currentText = todoText.textContent;
        
        // Create input field for editing with current task text
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        // Style input to match the design
        input.style.width = '100%';
        input.style.padding = '5px';
        input.style.border = `2px solid var(--primary-light)`;
        input.style.borderRadius = '6px';
        input.style.fontSize = '1rem';
        input.style.fontFamily = 'inherit';
        
        // Replace text with input for editing
        todoText.style.display = 'none';
        todoText.parentNode.insertBefore(input, todoText);
        input.focus();
        input.setSelectionRange(0, input.value.length); // Select all text for convenience
        
        // Function to save the edited text
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText !== '') {
                // Update task text in the tasks array
                tasks = tasks.map(t => {
                    if (t.id === task.id) {
                        t.text = newText;
                    }
                    return t;
                });
                
                // Update DOM with new text
                todoText.textContent = newText;
                saveTasks();
            }
            
            // Restore original display
            todoText.style.display = 'block';
            input.remove();
        };
        
        // Set up event listeners for saving on blur and Enter key
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }
    
    // ===== BATCH OPERATIONS =====
    // Clear all completed tasks
    function clearCompleted() {
        // Get IDs of all completed tasks
        const completedIds = tasks.filter(task => task.completed).map(task => task.id);
        
        // Remove completed tasks from tasks array
        tasks = tasks.filter(task => !task.completed);
        
        // Remove completed tasks from DOM with animation
        completedIds.forEach(id => {
            const taskElement = document.querySelector(`[data-id="${id}"]`);
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                taskElement.remove();
            }, 300);
        });
        
        // Update empty state and counter after animations
        setTimeout(() => {
            if (tasks.length === 0) renderAllTasks(); // Show empty state if needed
            updateItemsCount();
        }, 350);
        
        // Save changes to localStorage
        saveTasks();
    }
    
    // ===== FILTERING =====
    // Apply filter to show all, active, or completed tasks
    function applyFilter(filter) {
        const taskItems = document.querySelectorAll('.todo-item');
        
        // Show/hide tasks based on the selected filter
        taskItems.forEach(item => {
            switch (filter) {
                case 'all':
                    item.style.display = 'flex'; // Show all tasks
                    break;
                case 'active':
                    item.style.display = item.classList.contains('completed') ? 'none' : 'flex';
                    break;
                case 'completed':
                    item.style.display = item.classList.contains('completed') ? 'flex' : 'none';
                    break;
            }
        });
    }
    
    // ===== UTILITIES =====
    // Update the count of remaining items
    function updateItemsCount() {
        const activeCount = tasks.filter(task => !task.completed).length;
        // Update the text with proper pluralization
        itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    }
    
    // ===== DATA PERSISTENCE =====
    // Save tasks to localStorage for persistence across page reloads
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});






/*
document.addEventListener('DOMContentLoaded',()=>{
    // step 1 is usually to grab the elements
const todoInput =  document.querySelector('#todo-input');
const button =  document.querySelector('#add-task-btn');
const todoList =  document.querySelector('#todo-list');


// step 2 is basically we have to store the tasks 
let tasks = JSON.parse(localStorage.getItem('tasks')) || []
tasks.forEach((task)=>renderTask(task))
// how can we get the task it will always starts as an empty array
//turns out i will use an || operation is there is nothing inside the local storage you can't get anything form lacal storage we have write the code local storage
//. getitem will grab your item 
// all this thing is not useable beacuse we can't use string if we cant find anything in teh rparse statent it will act as a empty array
// imdeatily after that if somthing to display and run a loop for each it takes the elmenet



// main step 1 we have to create a task in array
button.addEventListener('click',function(){
   const taskText = todoInput.value.trim()
   if(taskText === "") return;

   // for creating a task first we have to give them some properties
   const newTask ={
    id: Date.now(),
    text : taskText,
    completed : false,
   };

   tasks.push(newTask)
   saveTasks();
   renderTask(newTask)
   todoInput.value = ""; // clear input
   console.log(tasks);

})



// Function to render a task
function renderTask(task) {
    const li = document.createElement("li"); // ✅ Corrected
    li.setAttribute("data-id", task.id);
    if (task.completed) li.classList.add("completed");

    // ✅ Corrected innerHTML property
    li.innerHTML = `<span>${task.text}</span> <button>Delete</button>`;

    // ✅ Add event listener to toggle task completion
    li.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;
        task.completed = !task.completed;
        li.classList.toggle("completed");
        saveTasks();
    });

    // ✅ Attach delete button event after innerHTML is set
    li.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent toggle from firing
        tasks = tasks.filter((t) => t.id !== task.id);
        li.remove();
        saveTasks();
    });

    todoList.appendChild(li);
}


// main step 2 we have to store the task which we have created above
function saveTasks(){
    localStorage.setItem('tasks',JSON.stringify(tasks))
}

// this is interview question of localstorsage what happens bheind the seen of arrays
// one thing we very know that it's not updating the task here it actually updating whole storage once at a time
// the whole array going once there hey write into the local storage and rewrites the whole thing

// this is the main aproach or thinking behind the render function
// as soon as the page load i want to read form the lacal storage grab all the tasks store all the task inside the tasks array
// and imidaietlly after that i have to run a loop  inside the loop i will read all the individual task and i would call my method on each of the task or render task
// so it can go ahead and render it 


// why we wrap this thing in the document.addEventListener('DOMContentLoaded') because all these things have the potential faillure beacuse may we some issues server delay or something
// and we are trying to get button which add task be expect that button is there but it is not there in that case
// const todoInput will not work because you dom was not ready
// good idea is once my dom content is loaded then i should grab my input and idea
})

*/