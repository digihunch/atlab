# Ansible Tower Lab

This project uses AWS cdk to provision resource in AWS, to create a lab environment for **Ansible Tower**. The language is TypeScript.  This project uses AWX project, which is the upstream open-source project for Ansible Tower.


# AWS CDK
CDK is AWS cloud development kit, to simplify the creation of cloud resources. It supports several programming languages such as typescript, Python, etc. This project uses typescript.



## Usage

Use AWS cdk commands to build infrastructure (aws environment must be configured).
```
cdk deploy VpcStack
cdk deploy SecurityStack
cdk deploy BastionStack
cdk deploy PrivateStack
```
The Bastion Server serves as AWS server. It is installed with components that are required, such as docker, docker-compose, and python3. Once the Bastion instance is initialized, SSH to it, then run:
```
$ cd ~/awx-*/installer
$ ansible-playbook -i inventory install.yml
```
If failed with "psycopg2.errors.UndefinedTable: relation main_organization does not exist", then according to [this issue](https://github.com/ansible/awx/issues/8863), you need to wait for a few second and run again.

Once installation is completed, browse with HTTP, use admin/password as default credential to log on.
