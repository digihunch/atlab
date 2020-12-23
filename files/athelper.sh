#! /usr/bin/bash
# AWS_REGION should be set in user profile
declare -a IPS=""
for ID in $(aws autoscaling describe-auto-scaling-instances --query "AutoScalingInstances[?contains(AutoScalingGroupName,'PrivateInstanceASG')].InstanceId" --output text);
do
    IP=($(aws ec2 describe-instances --instance-ids $ID --query Reservations[].Instances[].PrivateIpAddress --output text));
    echo $IP
    IPS+=$IP
done
