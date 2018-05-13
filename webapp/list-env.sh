#!/bin/sh

# Example Usage:
#   ./stack-deploy.sh ProdCornChat
#   ./stack-deploy.sh TestCornChat

export CORNCHAT_PRIVATE_BUCKET=cornchat-private

set -o pipefail -e

THIS_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${THIS_SCRIPT_DIR}"

if [[ $# -eq 0 ]] ; then
    echo 'Example Usage: ./list-env.sh TestCornChat'
    return 1
fi

found=$(which aws)
if [ -z "$found" ]; then
  echo "Please install the AWS CLI under your PATH: http://aws.amazon.com/cli/"
  return 1
fi

APP_NAME=$1
STACK_NAME=$APP_NAME

aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query Stacks[].Outputs[*].[OutputKey,OutputValue] --output text > ./build/vars.txt

TAB=$'\t'
export CORNCHAT_AWS_REGION='us-east-1'
export CORNCHAT_APP_NAME=$APP_NAME
export CORNCHAT_IDENTITY_POOL_ID=$(cat ./build/vars.txt | sed -n "s/^IdentityPool${TAB}\(.*\)/\1/p")
export CORNCHAT_GRAPHQL_ENDPOINT_URL=$(cat ./build/vars.txt | sed -n "s/^GraphQLApiEndpoint${TAB}\(.*\)/\1/p")
export CORNCHAT_TABLE_API_TOKENS=$(cat ./build/vars.txt | sed -n "s/^DynamoDBTableNameApiTokens${TAB}\(.*\)/\1/p")
export CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME=login.$APP_NAME
rm -f ./build/vars.txt

echo "export CORNCHAT_AWS_REGION=${CORNCHAT_AWS_REGION}"
echo "export CORNCHAT_APP_NAME=${CORNCHAT_APP_NAME}"
echo "export CORNCHAT_IDENTITY_POOL_ID=${CORNCHAT_IDENTITY_POOL_ID}"
echo "export CORNCHAT_GRAPHQL_ENDPOINT_URL=${CORNCHAT_GRAPHQL_ENDPOINT_URL}"
echo "export CORNCHAT_TABLE_API_TOKENS=${CORNCHAT_TABLE_API_TOKENS}"
echo "export CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME=${CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME}"
