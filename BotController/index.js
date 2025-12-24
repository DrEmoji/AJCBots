const WebSocket = require('ws');
const socket = "ws://localhost:3000"; 

module.exports = function ({ dispatch, application }) {
  let x = 0;
  let y = 0;
  let cfollow = false;

  const ws = new WebSocket(socket);

  function Log(message, type) {
    application.consoleMessage({
      message: `[BotController] ${message}`,
      type: type
    });
  }

  ws.on('open', () => {
    Log(`Connected to ${socket}`,"logger");
  });

  ws.on('error', (err) => {
    Log(`WS Error: ${err.message}`,"error");
  });

  ws.on('close', () => {
    Log(`WebSocket connection closed`,"error");
  });

  function sendWS(message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }

  const handleMovementUpdate = async ({ message }) => {
    x = message.value[6];
    y = message.value[7];

    if (cfollow) {
      sendWS(`circle ${x} ${y} 150`);
    }
  };

  dispatch.onMessage({
    type: 'connection',
    message: 'au',
    callback: handleMovementUpdate
  });

  const handleJoinUserCommand = async ({ parameters }) => {
    sendWS(`joinuser ${parameters[0]}`);
  };

  const handleChatCommand = async ({ parameters }) => {
    sendWS(`chat ${parameters.join(" ")}`);
  };

  const handleEmojiCommand = async ({ parameters }) => {
    sendWS(`emoji ${parameters[0]}`);
  };

  const handlePoseCommand = async ({ parameters }) => {
    sendWS(`setpose ${parameters[0]} ${parameters[1]}`);
  };

  const handleEmoteCommand = async ({ parameters }) => {
    sendWS(`emote ${parameters[0]}`);
  };
  
  const handleAlphaCommand = async ({ parameters }) => {
    sendWS(`alpha ${parameters[0]}`);
  };

  const handleJoinDenCommand = async ({ parameters }) => {
    sendWS(`joinden ${parameters[0]}`);
  };

  const handleCircleCommand = async ({ parameters }) => {
    sendWS(`circle ${x} ${y} ${parameters[0]}`);
  };

  const handleRandomPosCommand = async ({ parameters }) => {
    sendWS(`randompos ${x} ${y} ${parameters[0]}`);
  };

  const handleWaveCommand = async ({ parameters }) => {
    sendWS(`wave ${x} ${y}`);
  };

  const handleHeartCommand = async ({ parameters }) => {
    sendWS(`heart ${x} ${y}`);
  };

  const handleStarCommand = async ({ parameters }) => {
    sendWS(`star ${x} ${y}`);
  };

  const handleRainbowCommand = async ({ parameters }) => {
    sendWS(`rainbow`);
  };

  const handleCFollowCommand = async ({ parameters }) => {
    cfollow = !cfollow
    Log(`CFollow: ${cfollow}`,"logger");
  };

  dispatch.onCommand({
    name: 'joinuser',
    description: 'Bots will join the user',
    callback: handleJoinUserCommand
  });

  dispatch.onCommand({
    name: 'joinden',
    description: 'Bots will join the den',
    callback: handleJoinDenCommand
  });

  dispatch.onCommand({
    name: 'cfollow',
    description: 'Bots will circle follow the bot user',
    callback: handleCFollowCommand
  });

  dispatch.onCommand({
    name: 'circle',
    description: 'Bots will make circle',
    callback: handleCircleCommand
  });

  dispatch.onCommand({
    name: 'randompos',
    description: 'Bots will go to random positions',
    callback: handleRandomPosCommand
  });

  dispatch.onCommand({
    name: 'wave',
    description: 'Bots will make wave',
    callback: handleWaveCommand
  });

  dispatch.onCommand({
    name: 'heart',
    description: 'Bots will make heart',
    callback: handleHeartCommand
  });

  dispatch.onCommand({
    name: 'star',
    description: 'Bots will make star',
    callback: handleStarCommand
  });

  dispatch.onCommand({
    name: 'pose',
    description: 'Bots will change animation',
    callback: handlePoseCommand
  });

  dispatch.onCommand({
    name: 'alpha',
    description: 'Bots will become transparent',
    callback: handleAlphaCommand
  });

  dispatch.onCommand({
    name: 'rainbow',
    description: 'Bots will be rainbowy',
    callback: handleRainbowCommand
  });

  dispatch.onCommand({
    name: 'chat',
    description: 'Bots will chat message',
    callback: handleChatCommand
  });

  dispatch.onCommand({
    name: 'emoji',
    description: 'Bots will send emoji',
    callback: handleEmojiCommand
  });

  dispatch.onCommand({
    name: 'emote',
    description: 'Bots will do emote',
    callback: handleEmoteCommand
  });
};
