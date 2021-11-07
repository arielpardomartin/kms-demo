const AWS = require('aws-sdk');
const kms = new AWS.KMS();
exports.handler = async (event) => {
    const response = {
        statusCode: 200,
    };
    
    const payload = JSON.parse(event.body);
    const params = {
    	KeyId: payload.keyid,
    	Plaintext: payload.password
    };
    
    let data = await kms.encrypt(params).promise();
	const base64EncryptedString = data.CiphertextBlob.toString('base64');
	console.log('base64 encrypted string: ' + base64EncryptedString);
	response.body = data.CiphertextBlob.toString('base64');
    return response;
};