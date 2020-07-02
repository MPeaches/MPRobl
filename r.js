const Discord = require('discord.js');
const initInfo = require('initInfo.json')
const client = new Discord.Client();
const request = require("request")
const cheerio = require("cheerio")
const util = require("util")
const vkLinkRgxp = /https:\/\/vk\.com\/wall-[^\s\?а-яa-z]*/gm
const vkReplyRgxp = /https:\/\/vk\.com\/wall-.*[0-9]_.*[0-9]\?reply=[^\s\?а-яa-z]*/gm

const requestOptions = {
  url: '',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.121 Safari/537.36 Vivaldi/2.8.1664.44',
    'Accept-Charset': 'utf-8'
  }
}

const someoneTemplates = [
  "(◕‿◕✿)",
  "（✿ ͡◕ ᴗ◕)つ━━✫・o。",
  "(╯°□°）╯︵ ┻━┻",
  "ヽ༼ ಠ益ಠ ༽ﾉ",
  "¯\\_(ツ)_/¯",
  "(⁄ ⁄•⁄ω⁄•⁄ ⁄)",
  "ಠ_ಠ",
  "༼ つ ◕_◕ ༽つ",
  "(∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ. o ･ ｡ﾟ",
]

var chnls = new Map();
initInfo.permChannels.forEach(e => {
  chnls.set(e);
});
client.on('ready', () => {
  console.log('I am ready!');
});

client.on('uncaughtException', e => {return})

client.on('message', message => {  
  if (!message.guild) return;
  const mmbr = message.guild.member(message.author);
  if (mmbr == client.user) return;

 // if (message.content.startsWith("@someone")){
 //   message.channel.send(someoneTemplates[Math.floor(Math.random()*someoneTemplates.length)] +
 //   ` (${message.guild.members.random().displayName}) ` + message.content.substring(9));
 // }

  if (vkLinkRgxp.test(message.content)){
  let lir = [], zhopa = [], firstImage;
  requestOptions.url =  message.content.match(vkLinkRgxp)[0]
  const promisifiedReq = util.promisify(request)
  promisifiedReq(requestOptions).then(
    (fuck) => {
      var $ = cheerio.load(fuck.body)
      if ($(".message_page_body").length > 0) {
        message.channel.send(`Страница скрыта`); 
        return;
      }
      if ($(".copy_post_img").length > 0) {
        message.channel.send(`Репосты не поддерживаются`);
        return;
      }
      $(".wall_post_cont .page_post_thumb_wrap")
      .each((index, element) => {
         lir.push($(element).attr("onclick"));
      })
      zhopa = getVKLinks(lir);
      return promisifiedReq(requestOptions.url)
    }).then((fuck) => {
      let $ = cheerio.load(fuck.body)
  
    const ava = $(".wi_img").attr("src"),
          authorName = $(".pi_author").text(),
          postText = $(".pi_text").text();
    ava.length -= 6;
    if (zhopa.length == 0) zhopa[0]='';
  
    const vkPostInfo = {embed:{
      author: {
        name: authorName, 
        icon_url: ava
      },
      description: postText,
      image: {
        url: zhopa[0] 
      } 
    }
    }

    if (zhopa.length == 0 || zhopa.length == 1) {
      message.channel.send(vkPostInfo)
    } else if (zhopa.length > 1) {
      message.channel.send(vkPostInfo).then(() => {
        zhopa.shift()
        zhopa.join('\n')
        message.channel.send(zhopa.splice(0, 4)).then(() => {
          if (zhopa.length > 1) message.channel.send(zhopa)}
              );
        });
	}
    }).catch(e => console.log(e))
  }

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
    case "!colorme":
	if (!initInfo.permGuilds.includes(message.guild.id)) break;
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
!toggle ***полное имя роли*** - включить/выключить желаемую роль. Полное имя роли можно найти, начав вводить его после \"@\". \"@"\ перед отправкой сообщения нужно убрать!`,
}});
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

function getVKLinks(arrPar)
{
  let _arr = [];
  arrPar.forEach(element => {
        element = element.match(/"[a-z]":"https.*?"/gm).sort();
        if (element[0][1] === 'w') {
          element = element[0].substr(5).replace(/[\\"]/g, '');
        } else {
          element = element.reverse()[0].substr(5).replace(/[\\"]/g, '');
        }
    _arr.push(element);
  })
  return _arr;
}

client.login(initInfo.key);
