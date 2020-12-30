#! /usr/bin/bash
# AWS_REGION should be set in user profile


source ~/.awx/awxcompose/environment.sh
AWX_CRED=$AWX_ADMIN_USER:$AWX_ADMIN_PASSWORD  # load credentials from def configuration
AWX_INV_ID=2              # assuming the inventroy to be created will have an ID of 2. ID 1 is
curl -XPOST --user $AWX_CRED -H "Content-Type: application/json" --data '{"name":"Private Instance Inventory","variables":"ansible_user: ec2-user","organization":1}' http://localhost/api/v2/inventories/ | python -m json.tool

for ID in $(aws autoscaling describe-auto-scaling-instances --query "AutoScalingInstances[?contains(AutoScalingGroupName,'PrivateInstanceASG')].InstanceId" --output text);
do
    IP=($(aws ec2 describe-instances --instance-ids $ID --query Reservations[].Instances[].PrivateIpAddress --output text));
    echo -n "Adding instance to inventory: $ID"
    echo "  $IP"
    curl -XPOST --user $AWX_CRED -H "Content-Type: application/json" --data '{"description":"PrivInstance","instance_id":"'"$ID"'","name":"'"$IP"'"}' http://localhost/api/v2/inventories/$AWX_INV_ID/hosts/ | python -m json.tool
done

echo "please check the hosts above in Ansible inventory named Private Instance Inventory"
