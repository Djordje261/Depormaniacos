let connectedUsers = [];
let userPoints = [];
let time1 = 10;
let time2 = 15;
let questions;
let currentQuestionIndex = -1;
let loop;
let ioInstance;

function handleConnection(socket, io) {
  console.log('Cliente conectado.');
  ioInstance = io;

  socket.emit('usuarios', connectedUsers);

  socket.on('nickname', (data) => handleNickname(data, socket));
  socket.on('score', (data) => handleScore(data));
  socket.on('register', (data) => handleRegister(data));
  socket.on('restart', (data) => handleRestart(data));
}

function handleNickname(data, socket) {
  if (data === 'admin') {
    socket.emit('admin', true);
  } else {
    if (!connectedUsers.includes(data)) {
      connectedUsers.push(data);
      ioInstance.emit('usuarios', connectedUsers);
    } else {
      socket.emit('admin', false);
    }
  }
}

function handleScore(data) {
    const index = userPoints.findIndex((point) => point.nom === data.name);
    if (index !== -1) {
      userPoints[index].punts += parseInt(data.puntos);
    }
  }
  

  function handleRegister(data) {
    if (!loop) {
      const filePath = `./public/${data}.json`;
      try {
        questions = require(filePath);
        loop = setInterval(updateTimers, 750);
        time1 = 10; // Reiniciar el temporizador de la fase 1
        ioInstance.emit('time1', time1); // Emitir el tiempo inicial a los clientes
      } catch (error) {
        console.error(`Error al cargar las preguntas desde el archivo ${filePath}: ${error}`);
      }
    }
  }
  

  function handleRestart(data) {
    connectedUsers.length = 0;
    userPoints.length = 0;
    time1 = 10;
    time2 = 15;
    currentQuestionIndex = -1;
    clearInterval(loop);
    loop = null;
    ioInstance.emit('reestablish', true);
  }
  
  function updateTimers() {
    if (time1 > 0) {
      userPoints = connectedUsers.map((user) => ({ nom: user, punts: 0 }));
      time1--;
      ioInstance.emit('time1', time1);
    } else {
      ioInstance.emit('start', true);
  
      if (currentQuestionIndex === -1) {
        userPoints.sort((a, b) => b.punts - a.punts);
        ioInstance.emit('puntos', userPoints);
        ioInstance.emit('pregunta', questions[++currentQuestionIndex]);
      } else if (time2 > 0) {
        time2--;
        ioInstance.emit('time2', time2);
      } else if (time2 === 0) {
        if (currentQuestionIndex < questions.length - 1) {
          time2 = 10;
          userPoints.sort((a, b) => b.punts - a.punts);
          ioInstance.emit('puntos', userPoints);
          ioInstance.emit('pregunta', questions[++currentQuestionIndex]);
        } else {
          ioInstance.emit('puntos', userPoints);
          ioInstance.emit('end', true);
          clearInterval(loop);
        }
      }
    }
  } 
  
  

module.exports = { handleConnection };
