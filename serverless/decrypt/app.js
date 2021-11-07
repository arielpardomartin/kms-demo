const AWS = require('aws-sdk');

const secret = new AWS.SecretsManager();
const kms = new AWS.KMS();

exports.handler = async (event) => {
    const payload = JSON.parse(event.body);
    let decrypted;
    const encrypted = payload.CiphertextBlob;
    let data;
    let secreteManagerResponse;
    try {
        let decryptParams = { CiphertextBlob: Buffer.from(encrypted, 'base64')};
        data = await kms.decrypt(decryptParams).promise();
        console.log("Data: ",data);
        decrypted = data.Plaintext.toString('ascii');
        console.log("decrypted: ",decrypted);
        const secretManagerParams = { 
            Name: payload.name,
            Description: payload.description, 
            SecretString: decrypted
        };
        secreteManagerResponse = await secret.createSecret(secretManagerParams).promise();
        console.log("response: ",secreteManagerResponse);
        
    } catch (err) {
        console.log('Decrypt error:', err);
        throw err;
    }
    return { statusCode: 200, body: JSON.stringify(secreteManagerResponse) };
};