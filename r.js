const Discord = require('discord.js');
const client = new Discord.Client();
var chnls = new Map();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('error', err => {
	if (err.code !== 'ECONNRESET'){throw err}
})

client.on('uncaughtException', e => {})

client.on('message', message => {  
  if (!message.guild) return;
  const mmbr = message.guild.member(message.author);
  if (mmbr == client.user) return;

  if (message.content.startsWith('!setchannel') && (mmbr.hasPermission('ADMINISTRATOR'))) {
    chnls.set(message.guild.id, message.channel.id);
    message.channel.send(`Канал выбран, напиши !robl для помощи`);
  };

  if (chnls.get(message.guild.id) == undefined && message.content == '!robl') { 
    message.channel.send(`Канал не выбран. Админ должен написать !setchannel, чтобы выбрать этот канал`); return; }
  if (chnls.get(message.guild.id) != message.channel.id) return;

  if (message.content.startsWith('!cleancolors') && mmbr.hasPermission('ADMINISTRATOR')) {
    message.guild.roles.forEach(role => {
      if ((role.name.endsWith(' col'))) role.delete();
    });
    message.channel.send('Цветные роли удалены')
  };

  switch (message.content.split(" ")[0]){
    case "!colorme" :
    try{
      let clr = message.content.split(" ").pop(); if (clr.startsWith('#')) clr = clr.substr(1);
      if (clr === 'random') {
        clr = Math.floor(Math.random() * (0xFFFFFF + 1));
      } else if (isNaN(parseInt(clr, 16))) {
        throw "Out of range/isNaN\n" + parseInt(clr, 16) + '\n' + clr;
      };
  
        if (mmbr.roles.find(a => a.name.endsWith(' col'))) { //меняем цвет существующей col роли
            mmbr.roles.find(a => a.name.endsWith(' col')).edit({
              name: clr + ' col',
              color: clr
            }).catch(console.error);
            message.channel.send(`${mmbr.displayName} сменил цвет`)
        }
        else { //создаем и присваиваем роль
          message.guild.createRole({
            name: clr + ' col',
            color: clr,
            mentionable: false
          }).then(function(role) {
            mmbr.addRole(role); 
            message.channel.send(`${mmbr.displayName} теперь цветной`)
          }).catch(console.error);
        }
      } catch (e) { message.channel.send(`${mmbr.displayName}, такого цвета я не знаю`) }
      break;
      


      case "!cleanme" :
      try{
        mmbr.roles.find(a => a.name.endsWith(' col')).delete();
        message.channel.send(`${mmbr.displayName} теперь ч/б`)
      }catch (e) { message.channel.send(`${mmbr.displayName}, ты бесцветный`) }
      break;



      case "!robl" :
      message.channel.send({embed: {
        author: {
          name: 'Хелп', 
          icon_url: client.user.avatarURL
        },
        description: `!robl - помощь
!colorme [хекскод цвета](https://color-hex.com) или random - присвоить себе цвет
!cleanme - удалить цветную роль
!toggle ***полное имя роли*** - включить/выключить желаемую роль. Полное имя роли можно найти, начав вводить его после \"@\"`}});
      break;
      


      case "!toggle" :
        const rlnm = message.content.substr(message.content.indexOf(" ") + 1);
        const rlnmrole = message.guild.roles.find(a => a.name === rlnm)
        if (mmbr.roles.find(a => a.name === rlnm)) {
        mmbr.removeRole(rlnmrole);
        message.channel.send(`${mmbr.displayName}, роль удалена`);
        } else {
          mmbr.addRole(rlnmrole)
          .then(() => {message.channel.send(`${mmbr.displayName}, роль добавлена`);})
          .catch(() => {message.channel.send(`${mmbr.displayName}, у меня нет прав на эту роль`); return })
          }
        break;
  }  
})

client.login('token');