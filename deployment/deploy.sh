#!/bin/bash
region=$(aws configure get region)
printf "\nThe region currently configured is \x1b[33m${region}\x1b[0m.\n\n"

read -p "Stack name: " stackname

npm i --silent

printf "\nGenerating Lambda functions zip files...\n"
node zip-generator.js ../serverless/decrypt
node zip-generator.js ../serverless/encrypt

if [ ${region} == 'us-east-1' ]
then
    aws s3api create-bucket --bucket kms-demo-lambda-bucket --region ${region}
else
    aws s3api create-bucket --bucket kms-demo-lambda-bucket --region ${region} --create-bucket-configuration LocationConstraint=${region}
fi

aws s3 cp decrypt.zip s3://kms-demo-lambda-bucket/
aws s3 cp encrypt.zip s3://kms-demo-lambda-bucket/


STACK=$( \
aws cloudformation create-stack --stack-name $stackname \
--template-body file://template.yaml \
--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND )

printf "\n\nCreating stack \x1b[33mlambdatest\x1b[0m...\n$STACK"
aws cloudformation wait stack-create-complete --stack-name $stackname
if [ $? != 0 ]; then exit 1; fi

printf "\n\nSaving stack outputs...\n"
aws cloudformation describe-stacks --stack-name $stackname > stack.json

printf "\n\nStack creation complete!\n"

node generate-output.js --stackOutputFilePath stack.json