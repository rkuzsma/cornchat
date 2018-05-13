#!/bin/sh

# Example Usage:
#   ./stack-deploy.sh ProdCornChat
#   ./stack-deploy.sh TestCornChat

# Replace with your own already-provisioned S3 bucket and path.
# Stack templates will be stored in the PRIVATE folder.
# Upon successful deploy of the stack, a file named STACK_NAME/public-config.json
# will be uploaded to the PUBLIC folder containing the IdentityPool ID
# and GraphQL API endpoint for use by client JavaScript apps.
export S3_BUCKET=${S3_BUCKET:-cornchat}
export S3_PRIVATE_FOLDER=${S3_PRIVATE_FOLDER:-private}
export S3_PUBLIC_FOLDER=${S3_PUBLIC_FOLDER:-public}

set -o pipefail -e

THIS_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${THIS_SCRIPT_DIR}"

if [[ $# -eq 0 ]] ; then
    echo 'Example Usage: ./stack-deploy.sh TestCornChat'
    return 1
fi

found=$(which aws)
if [ -z "$found" ]; then
  echo "Please install the AWS CLI under your PATH: http://aws.amazon.com/cli/"
  return 1
fi

export APP_NAME=$1
export STACK_NAME=$APP_NAME
export STACK_FOLDER=$S3_PRIVATE_FOLDER/cloudformation/$STACK_NAME
export STACK_PATH=$S3_BUCKET/$STACK_FOLDER
export LAMBDA_FOLDER=$STACK_FOLDER/lambda
export LAMBDA_PATH=$S3_BUCKET/$LAMBDA_FOLDER
export PUBLIC_CONFIG_FOLDER=$S3_PUBLIC_FOLDER/$STACK_NAME/public-config

echo "Deploying CornChat as '$STACK_NAME'"
rm -rf ./build

echo "---"
echo "Building, validating, and uploading templates to s3://$STACK_PATH/templates"
mkdir -p ./build/cloudformation
cp -r ./cloudformation ./build
# Run ESH on all cloudformation files to evaluate embedded <% %> shell expressions
pushd ./build/cloudformation
for f in $(find ./graphql -type f); do
  ../../esh -o $f $f
  chmod -w $f
done
for f in $(find ./templates -type f); do
  ../../esh -o $f $f
  chmod -w $f
done
popd
aws cloudformation validate-template \
  --template-body file://build/cloudformation/templates/template.yaml

# Copy our cloudformation templates into the bucket
aws s3 sync ./build/cloudformation/templates/ s3://$STACK_PATH/templates
echo "Templates uploaded"

echo "----"
echo "Building and uploading lambdas to s3://$LAMBDA_PATH"
npm run build
for f in $(ls -1 ./build/lambda); do
  pushd ./build/lambda/
  f_no_ext=${f%.*}
  mv $f index.js
  zip $f_no_ext.zip ./index.js
  rm -f index.js
  popd
done
aws s3 sync ./build/lambda/ s3://$LAMBDA_PATH
echo "Lambdas uploaded"

echo "----"
set +e
STATUS=$((aws cloudformation describe-stacks --stack-name $STACK_NAME) 2>&1)
set -e
if echo $STATUS | grep -q 'does not exist'; then
  echo "Creating stack '$STACK_NAME'"
  CF_COMMAND=create-stack
else
  if echo $STATUS | grep -q 'ROLLBACK_COMPLETE'; then
    echo "ERROR: Stack is in ROLLBACK_COMPLETE status. You cannot update it. To proceed, run: "
    echo "aws cloudformation delete-stack --stack-name $STACK_NAME"
    return 1
  else
    echo "Updating stack '$STACK_NAME'"
    CF_COMMAND=update-stack
  fi
fi
aws cloudformation $CF_COMMAND \
  --stack-name $STACK_NAME \
  --template-url https://s3.amazonaws.com/$STACK_PATH/templates/template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=AppName,ParameterValue=$APP_NAME \
    ParameterKey=PublicConfigS3Bucket,ParameterValue=$S3_BUCKET \
    ParameterKey=PublicConfigS3Folder,ParameterValue=$PUBLIC_CONFIG_FOLDER \
    ParameterKey=LambdaS3Bucket,ParameterValue=$S3_BUCKET \
    ParameterKey=LambdaS3Folder,ParameterValue=$LAMBDA_FOLDER \

echo "----"
echo "Detailed deployment status is in the AWS CloudFormation console."
echo "To see deploy status, use:\n  aws cloudformation describe-stacks --stack-name $STACK_NAME"
