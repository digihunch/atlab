#! /bin/bash

sed -i -z 's/volumes:/&\n      - \"~\/.ssh\/id_rsa:\/root\/.ssh\/id_rsa:ro\"/2' ~/awx-*/installer/roles/local_docker/templates/docker-compose.yml.j2


echo "update the following file with ssh key mapping:"
echo "~/awx-*/installer/roles/local_docker/templates/docker-compose.yml.j2"
echo "Now you can go to ~/awx-*/installer and run ansible-playbook -i inventory install.yml"
