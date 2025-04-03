// step 1 is usually to grab the elements
const todoInput =  document.querySelector('#todo-input');
const button =  document.querySelector('#add-task-btn');
const todoList =  document.querySelector('#todo-list');


// step 2 is basically we have to store the tasks 

let tasks = []

// main step 1 we have to add task in array

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
   todoInput.value = ""; // clear input
   console.log(tasks);

})
