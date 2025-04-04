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
   todoInput.value = ""; // clear input
   console.log(tasks);

})

// this is how we render are texts
function renderTask(task){
   const li = document.createAttribute('li');
   li.setAttribute("data-id",task.id);
   if(task.completed) li.classList.add("completed")
   li.innerHtml = `<span>${task.text}</span> <button>delete</button>`;



   li.addEventListener('click',(e)=>{
    if(e.target.tagName === "BUTTON") return;
    task.completed =!task.completed;
    li.classList.toggle("completed");
    saveTasks();
   })

   
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