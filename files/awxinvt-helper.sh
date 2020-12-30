#! /usr/bin/bash
# AWS_REGION should be set in user profile
declare -a IPS=""
for ID in $(aws autoscaling describe-auto-scaling-instances --query "AutoScalingInstances[?contains(AutoScalingGroupName,'PrivateInstanceASG')].InstanceId" --output text);
do
    IP=($(aws ec2 describe-instances --instance-ids $ID --query Reservations[].Instances[].PrivateIpAddress --output text));
    echo $IP
    IPS+=$IP
done

echo "please add the hosts above in Ansible inventory"
# when ansible makes ssh connection, it connects from within the awx_task container. This is to map the private key for the ssh instance in container to use.

#sed -i -z 's/volumes:/&\n      - \"~\/.ssh\/id_rsa:\/root\/.ssh\/id_rsa:ro\"/2' ~/awx-*/installer/roles/local_docker/templates/docker-compose.yml.j2
