const fs = require('fs');
const AWS = require("aws-sdk");
const { stackOutputFilePath } = require("minimist")(process.argv.slice(2));

// Validate args
if (!stackOutputFilePath) {
    console.error('\n\nArg validation failed:\n--stackOutputFilePath argument is missing');
    process.exit(1);
}

// Function to filter stack.json outputs by output key
const findOutput = (outputs, key) => {
    return outputs.filter((output) => {
        return output.OutputKey === key;
    })[0].OutputValue;
};

const generateOutput = async () => {
    try {
        console.info("\n\nGenerating output values...\n");

        // Read stack.json file and get outputs section
        const stackInfo = JSON.parse(fs.readFileSync(stackOutputFilePath, 'utf8'));
        const cloudformationOutputs = stackInfo.Stacks[0].Outputs;

        // Get necessary values from stack output file
        const encryptApi = findOutput(
            cloudformationOutputs,
            'EncryptApi'
        );

        const decryptApi = findOutput(
            cloudformationOutputs,
            'DecryptApi'
        );

        const output = `
        KMS demo
        * EncryptApi = ${encryptApi}
        * DecryptApi = ${decryptApi}
        `;
        console.log('\x1b[33m%s\x1b[0m', output);
        
    } catch(error) {
        console.error(`\n\nScript execution failed:\n${error.message}`);
        process.exit(3);
    }
};

generateOutput();