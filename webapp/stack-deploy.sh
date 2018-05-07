#!/bin/sh

# Example Usage:
#   ./stack-deploy.sh ProdCornChat
#   ./stack-deploy.sh TestCornChat

CORNCHAT_PRIVATE_BUCKET=cornchat-private

set -o pipefail -e

if [[ $# -eq 0 ]] ; then
    echo 'Example Usage: ./stack-deploy.sh TestCornChat'
    exit 1
fi

APP_NAME=$1
STACK_NAME=$APP_NAME-stack

echo "Deploying CornChat as '$STACK_NAME'"
rm -rf ./build

echo "---"
echo "Building, validating, and uploading templates to s3://$CORNCHAT_PRIVATE_BUCKET/cloudformation/$STACK_NAME/templates"
mkdir -p ./build/templates
./esh -o ./build/templates/template.yaml ./cloudformation/templates/template.yaml
chmod -w ./build/templates/template.yaml
aws cloudformation validate-template \
  --template-body file://build/templates/template.yaml

# Copy our cloudformation templates into the bucket
aws s3 sync ./build/templates/ s3://$CORNCHAT_PRIVATE_BUCKET/cloudformation/$STACK_NAME/templates
echo "Templates uploaded"

echo "----"
echo "Building and uploading lambdas to s3://$CORNCHAT_PRIVATE_BUCKET/cloudformation/$STACK_NAME/lambda"
npm run build
aws s3 sync ./build/lambda/ s3://$CORNCHAT_PRIVATE_BUCKET/cloudformation/$STACK_NAME/lambda
echo "Lambdas uploaded"

echo "----"
set +e
STATUS=$((aws cloudformation describe-stacks --stack-name $STACK_NAME) 2>&1)
set -e
if echo $STATUS | grep -q 'does not exist'; then
  echo "Creating stack '$STACK_NAME'"
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-url https://s3.amazonaws.com/$CORNCHAT_PRIVATE_BUCKET/cloudformation/$STACK_NAME/templates/template.yaml \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters ParameterKey=AppName,ParameterValue=$APP_NAME
else
  echo "Stack already exists."
  if echo $STATUS | grep -q 'ROLLBACK_COMPLETE'; then
    echo "ERROR: Stack is in ROLLBACK_COMPLETE status. You cannot update it. To proceed, run: "
    echo "aws cloudformation delete-stack --stack-name $STACK_NAME"
    exit 1
  else
    echo "Updating stack..."
    aws cloudformation update-stack \
      --stack-name $STACK_NAME \
      --template-url https://s3.amazonaws.com/$CORNCHAT_PRIVATE_BUCKET/cloudformation/$STACK_NAME/templates/template.yaml \
      --capabilities CAPABILITY_NAMED_IAM \
      --parameters ParameterKey=AppName,ParameterValue=$APP_NAME
  fi
fi
echo "----"
echo "Detailed deployment status is in the AWS CloudFormation console."
echo "To see deploy status, use:\n  aws cloudformation describe-stacks --stack-name $STACK_NAME"
