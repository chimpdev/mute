exports.run = async (client, message, args) => {

  if(!message.member.permissions.has('MANAGE_MESSAGES')) return;
  if(!args[0]) return message.reply({ content: 'Lütfen bir kullanıcıyı etiketleyin.' });
  if(!message.mentions.members.first()) return message.reply({ content: 'Belirttiğiniz kullanıcı bulunamadı.' });
  const member = message.mentions.members.first();
  if(member.roles.highest.position >= message.member.roles.highest.position || member.user.id == message.guild.ownerId) return message.reply({ content: 'Bu kullanıcıyı susturamazsın.' });
  if(member.roles.highest.position >= message.guild.me.roles.highest.position) return message.reply({ content: 'Bu kullanıcıyı susturamıyorum.' });

  const request = require('native-request');
  const headers = {
    "accept": "/",
    "authorization": "Bot " + client.token,
    "content-type": "application/json",
  };

  await request.get(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, headers, async function(err, data, status, headers) {
    if(err) throw err;
    if(new Date(JSON.parse(data).communication_disabled_until || Date.now()).getTime() > Date.now()) return message.reply({ content: 'Bu kullanıcı zaten susturulmuş.' });

    if(!args[1] || isNaN(args[1]) || !args[2] || !['saniye', 'dakika', 'saat', 'gün', 'hafta', 'yıl'].includes(args[2])) return message.reply({ content: 'Lütfen bir süre belirtin.' });

    const timeout = require('ms')(args[1]+args[2].replace('saniye', 's').replace('saat', 'h').replace('gün', 'd').replace('hafta', 'w').replace('yıl', 'y').replace('dakika', 'm'));
    if(!timeout) return message.reply({ content: 'Lütfen geçerli bir süre belirtin.' });
  
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
        "communication_disabled_until": new Date(Date.now()+timeout)
      }),
      "method": "PATCH",
      "mode": "cors"
    });
    return message.reply({ content: `${member} üyesi **${args[1]} ${args[2]}** boyunca yazı kanallarında susturuldu.` });
  });

};
exports.config = {
  name: 'mute'
};
