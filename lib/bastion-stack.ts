import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import { readFileSync } from 'fs';

export class BastionStack extends cdk.Stack {
  public pubkey: string;
  constructor(scope: cdk.Construct, id: string, avpc: ec2.IVpc, bstn_sg: ec2.ISecurityGroup, role: iam.IRole, props?: cdk.StackProps) {
    super(scope, id, props)
    const user_data = readFileSync('files/user_data_bastion.sh','utf-8')
    let bastion_host = new ec2.Instance(this,'bastion-host', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2,ec2.InstanceSize.MEDIUM),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        edition: ec2.AmazonLinuxEdition.STANDARD,
        virtualization: ec2.AmazonLinuxVirt.HVM,
        storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE
      }),
      vpc: avpc,
      role: role,
      userData: ec2.UserData.custom(cdk.Fn.sub(user_data)),
      keyName: 'cskey',
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: bstn_sg,
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets:{
          "configSet1":["config_step_1","config_step_2"],
          "configSet2":["config_step_3","config_step_4","config_step_5"]
        },
        configs:{
          "config_step_1":new ec2.InitConfig([
            ec2.InitPackage.yum("git"),
            ec2.InitPackage.yum("python3"),
            ec2.InitPackage.yum("python-netaddr"),
            ec2.InitPackage.yum("docker")
          ]),
          "config_step_2": new ec2.InitConfig([
            ec2.InitCommand.shellCommand("amazon-linux-extras install -y ansible2"),
            ec2.InitCommand.shellCommand("runuser -l ec2-user -c 'pip3 install docker-compose --user'"),
            //ec2.InitCommand.shellCommand("groupadd docker"),
            ec2.InitGroup.fromName("docker"),
            ec2.InitCommand.shellCommand("usermod -aG docker ec2-user")
          ]),
          "config_step_3": new ec2.InitConfig([
            ec2.InitFile.fromFileInline(
              "/home/ec2-user/athelper.sh",
              "files/athelper.sh",
              {group: 'ec2-user', owner: 'ec2-user', mode: '000755'}
            ),
            ec2.InitSource.fromUrl(
              "/home/ec2-user/",
              "https://github.com/ansible/awx/archive/16.0.0.tar.gz"
            ),
            ec2.InitCommand.shellCommand("chown -R ec2-user:ec2-user /home/ec2-user/awx-*")
          ]),
          "config_step_4": new ec2.InitConfig([
            ec2.InitCommand.shellCommand("echo config_step_4"),
            ec2.InitService.enable("docker",{enabled: true, ensureRunning: true})
           // ec2.InitCommand.shellCommand("runuser -l ec2-user -c 'pip3 install docker-compose --user'")
           // ec2.InitCommand.shellCommand("docker pull ansible/awx_web"),
           // ec2.InitCommand.shellCommand("docker pull ansible/awx_task"),
           // ec2.InitCommand.shellCommand("docker pull redis"),
           // ec2.InitCommand.shellCommand("docker pull postgres"),
           // ec2.InitCommand.shellCommand("docker pull memcached")
          ]),
          "config_step_5": new ec2.InitConfig([
            ec2.InitCommand.shellCommand("runuser -l ec2-user -c 'docker pull ansible/awx_web && docker pull ansible/awx_task && docker pull redis && docker pull postgres && docker pull memcached'")
          ])
        }
      }),
      initOptions: {
        configSets: ["configSet1","configSet2"],
        printLog: true,
        ignoreFailures: true,
        timeout: cdk.Duration.minutes(10) 
      }
    });
    this.pubkey = bastion_host.instanceId + '-pubkey'
    new cdk.CfnOutput(this, "Output", {
      value: "ec2-user@"+bastion_host.instancePublicDnsName
    });
  }
}
