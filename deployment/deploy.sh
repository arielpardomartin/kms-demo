#!/bin/bash
region=$(aws configure get region)
npm i --silent
printf "\nGenerating Lambda functions zip files...\n"
node zip-generator.js ../serverless/decrypt
node zip-generator.js ../serverless/encrypt


aws s3api create-bucket --bucket kms-demo-lambda-bucket --region ${region}

aws s3 cp decrypt.zip s3://kms-demo-lambda-bucket/
aws s3 cp encrypt.zip s3://kms-demo-lambda-bucket/


STACK=$( \
aws cloudformation create-stack --stack-name lambdatest \
--template-body file://template.yaml \
--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND )

printf "\n\nCreating stack \x1b[33mlambdatest\x1b[0m...\n$STACK"
aws cloudformation wait stack-create-complete --stack-name lambdatest
if [ $? != 0 ]; then exit 1; fi