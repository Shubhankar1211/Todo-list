document.addEventListener('DOMContentLoaded', () => {
    // Grab all necessary elements
    const todoInput = document.querySelector('#todo-input');
    const addTaskBtn = document.querySelector('#add-task-btn');
    const todoList = document.querySelector('#todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.querySelector('#clear-completed');
    const itemsLeftSpan = document.querySelector('#items-left');
    
    // Initialize tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Initialize the app
    init();
    
    function init() {
        // Render existing tasks
        renderAllTasks();
        updateItemsCount();
        
        // Set up event listeners
        addTaskBtn.addEventListener('click', addTask);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
        clearCompletedBtn.addEventListener('click', clearCompleted);
        
        // Set up filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Apply filter
                applyFilter(btn.dataset.filter);
            });
        });
    }
    
    // Function to add a new task
    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === "") return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        };
        
        // Add task to array
        tasks.push(newTask);
        
        // Save and render
        saveTasks();
        renderTask(newTask);
        updateItemsCount();
        
        // Clear input
        todoInput.value = "";
        todoInput.focus();
    }
    
    // Function to render a single task
    function renderTask(task) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = task.id;
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
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
        
        // Toggle completion status
        const checkbox = li.querySelector('.checkbox');
        checkbox.addEventListener('click', () => {
            toggleTaskCompletion(task.id);
        });
        
        // Delete task
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });
        
        // Edit task
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editTask(li, task);
        });
        
        todoList.appendChild(li);
    }
    
    // Function to render all tasks
    function renderAllTasks() {
        // Clear existing list
        todoList.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No tasks yet. Add a task to get started!';
            todoList.appendChild(emptyState);
            return;
        }
        
        // Render each task
        tasks.forEach(task => renderTask(task));
    }
    
    // Toggle task completion
    function toggleTaskCompletion(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.completed = !task.completed;
            }
            return task;
        });
        
        // Update UI
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.classList.toggle('completed');
        taskElement.querySelector('.checkbox').classList.toggle('checked');
        
        saveTasks();
        updateItemsCount();
    }
    
    // Delete task
    function deleteTask(id) {
        // Remove from array
        tasks = tasks.filter(task => task.id !== id);
        
        // Remove from DOM with animation
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            taskElement.remove();
            if (tasks.length === 0) renderAllTasks(); // Show empty state if needed
            updateItemsCount();
        }, 300);
        
        saveTasks();
    }
    
    // Edit task
    function editTask(li, task) {
        const todoText = li.querySelector('.todo-text');
        const currentText = todoText.textContent;
        
        // Create input for editing
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        input.style.width = '100%';
        input.style.padding = '5px';
        input.style.border = `2px solid var(--primary-light)`;
        input.style.borderRadius = '6px';
        input.style.fontSize = '1rem';
        input.style.fontFamily = 'inherit';
        
        // Replace text with input
        todoText.style.display = 'none';
        todoText.parentNode.insertBefore(input, todoText);
        input.focus();
        input.setSelectionRange(0, input.value.length);
        
        // Function to save edit
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText !== '') {
                // Update task in array
                tasks = tasks.map(t => {
                    if (t.id === task.id) {
                        t.text = newText;
                    }
                    return t;
                });
                
                // Update DOM
                todoText.textContent = newText;
                saveTasks();
            }
            
            // Restore original display
            todoText.style.display = 'block';
            input.remove();
        };
        
        // Event listeners for edit input
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }
    
    // Clear completed tasks
    function clearCompleted() {
        const completedIds = tasks.filter(task => task.completed).map(task => task.id);
        
        // Remove from array
        tasks = tasks.filter(task => !task.completed);
        
        // Remove from DOM with animation
        completedIds.forEach(id => {
            const taskElement = document.querySelector(`[data-id="${id}"]`);
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                taskElement.remove();
            }, 300);
        });
        
        setTimeout(() => {
            if (tasks.length === 0) renderAllTasks(); // Show empty state if needed
            updateItemsCount();
        }, 350);
        
        saveTasks();
    }
    
    // Apply filter
    function applyFilter(filter) {
        const taskItems = document.querySelectorAll('.todo-item');
        
        taskItems.forEach(item => {
            switch (filter) {
                case 'all':
                    item.style.display = 'flex';
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
    
    // Update items count
    function updateItemsCount() {
        const activeCount = tasks.filter(task => !task.completed).length;
        itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    }
    
    // Save tasks to localStorage
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