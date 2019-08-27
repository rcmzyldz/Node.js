const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const app = express();

const port = 3000;

const todosFileName = './todos.json';

app.use(bodyParser.json());


function readTodos(res, cbFn) {
  fs.readFile(todosFileName, 'utf8', (error, data) => {
    if (error) {
      console.error(error);
      res.status(500).send('readTodos: Something went wrong!');
      return;
    }

    const todos = (!data) ? [] : JSON.parse(data);

    cbFn(todos);
  });
}

function writeTodos(res, newTodos, cbFn) {
  const newTodosTxt = JSON.stringify(newTodos);

  fs.writeFile(todosFileName, newTodosTxt, 'utf8', (error) => {
    if (error) {
      res.status(500).send('writeTodos: Something went wrong!');
      return;
    }

    cbFn(newTodos);
  });
}

/* **************
** ** GET /todos
** **************
*/
app.get('/todos', (req, res) => {
  readTodos(res, todos => res.send(todos));
});

// ***************
// ** POST /todos
// ***************
app.post('/todos', (req, res) => {
  const newTodo = req.body.todo;

  if (!newTodo) {
    res.status(400).send(`New todo should be in format: {
       "todo": {
         "description": "(todo description)"
       }
     }`);
    return;
  }
  newTodo['id'] = uuidv4();
  newTodo['done'] = false;

  readTodos(res, todos => {
    todos.push(newTodo);
    writeTodos(res, todos, () => res.status(201).send(todos));
  });
});

// ******************
// ** PUT /todos/:id
// ******************
app.put('/todos/:id', (req, res) => {
  const newId = req.params.id;
  const todo = req.body.todo;

  if (!newId) {
    res.status(400).send(`id is mandatory`);
    return;
  }
  if (!todo) {
    res.status(400).send(`New todo should be in format: {
       "todo": {
         "description": "(todo description)"
       }
     }`);
    return;
  }
  todo['id'] = newId;

  readTodos(res, todos => {
    const todoIx = todos.findIndex(t => t.id === newId);
    if (todoIx !== -1) {
      todos[todoIx] = todo;
      writeTodos(res, todos, () => res.status(201).send(todos));
    } else {
      res.status(201).send(todos);
    }
  });
});

// ************************
// ** POST /todos/:id/done
// ************************
app.post('/todos/:id/done', (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).send(`id is mandatory`);
    return;
  }

  readTodos(res, todos => {
    const todoIx = todos.findIndex(t => t.id === id);
    if (todoIx !== -1) {
      todos[todoIx]['done'] = true;
      writeTodos(res, todos, () => res.status(201).send(todos));
    } else {
      res.status(404).send('Todo with id: "' + id + '" not found');
    }
  });
});

// **************************
// ** DELETE /todos/:id/done
// **************************
app.delete('/todos/:id/done', (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).send(`id is mandatory`);
    return;
  }

  readTodos(res, todos => {
    const todoIx = todos.findIndex(t => t.id === id);
    if (todoIx !== -1) {
      todos[todoIx]['done'] = false;
      writeTodos(res, todos, () => res.status(201).send(todos));
    } else {
      res.status(404).send('Todo with id: "' + id + '" not found');
    }
  });
});

// ******************
// ** GET /todos/:id
// ******************
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).send(`id is mandatory`);
    return;
  }
  readTodos(res, todos => {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
      res.status(201).send(todo);
    } else {
      res.status(404).send('Todo with id: "' + id + '" not found');
    }
  });
});

// *********************
// ** DELETE /todos/:id
// *********************
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).send(`id is mandatory`);
    return;
  }

  readTodos(res, todos => {
    todos = todos.filter(todo => todo.id !== id);

    writeTodos(res, todos, () => res.status(201).send(todos));
  });
});

// *********************
// ** DELETE /todos
// *********************
app.delete('/todos', (req, res) => {
  const EMPTY_TODOS = [];
  writeTodos(res, EMPTY_TODOS, () => res.status(201).send(EMPTY_TODOS));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));