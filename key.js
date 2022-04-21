const encryptKey = require('./config.json').encryptKey;
var crypto = require('crypto'),
    algorithm = 'aes-256-cbc',
    password = Buffer.from(encryptKey);
const IV_LENGTH = 16;

function encrypt(text){
      let iv = crypto.randomBytes(IV_LENGTH);
      var cipher = crypto.createCipheriv(algorithm,password,iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');

}

function decrypt(text){
      if(!text){return;}
       let textParts = text.split(':');
       let iv = Buffer.from(textParts.shift(), 'hex');
       let encryptedText = Buffer.from(textParts.join(':'), 'hex');
       let decipher = crypto.createDecipheriv(algorithm, password, iv);
       let decrypted = decipher.update(encryptedText);

       decrypted = Buffer.concat([decrypted, decipher.final()]);

       return decrypted.toString();
}
exports.decrypt = decrypt;