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
      userData: ec2.UserData.custom(user_data),
      keyName: 'cskey',
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: bstn_sg,
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets:{
          "configSet1":["config_step_1","config_step_2"],
          "configSet2":["config_step_3","config_step_4"]
        },
        configs:{
          "config_step_1":new ec2.InitConfig(
            [ec2.InitPackage.yum("git")]
          ),
          "config_step_2": new ec2.InitConfig(
            [ec2.InitCommand.shellCommand("echo config_step_2")]
          ),
          "config_step_3": new ec2.InitConfig(
            [ec2.InitCommand.shellCommand("echo config_step_3")]
          ),
          "config_step_4": new ec2.InitConfig(
            [ec2.InitCommand.shellCommand("echo config_step_4")]
          )
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
