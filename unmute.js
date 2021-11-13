exports.run = async (client, message, args) => {

  if(!message.member.permissions.has('MANAGE_MESSAGES')) return;
  if(!args[0]) return message.reply({ content: 'Lütfen bir kullanıcıyı etiketleyin.' });
  if(!message.mentions.members.first()) return message.reply({ content: 'Belirttiğiniz kullanıcı bulunamadı.' });
  const member = message.mentions.members.first();

  const request = require('native-request');
  const headers = {
    "accept": "/",
    "authorization": "Bot " + client.token,
    "content-type": "application/json",
  };

  await request.get(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, headers, async function(err, data, status, headers) {
    if(err) throw err;
    if(new Date(JSON.parse(data).communication_disabled_until || Date.now()).getTime() <= Date.now()) return message.reply({ content: 'Bu kullanıcı zaten susturulmamış.' });
    
    const fetch = require('node-fetch');
    await fetch(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, {
      "credentials": "include",
      "headers": {
        "accept": "*/*",
        "authorization": "Bot " + client.token,
        "content-type": "application/json",
      },
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": JSON.stringify({
        "communication_disabled_until": Date.now()
      }),
      "method": "PATCH",
      "mode": "cors"
    });
    return message.reply({ content: `${member} üyesinin susturulması açıldı.` });
  });

};
exports.config = {
  name: 'unmute'
};
