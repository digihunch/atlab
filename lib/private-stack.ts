import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import autoscaling = require('@aws-cdk/aws-autoscaling')
import { readFileSync } from 'fs';


// to do finish the private stack!
export class PrivateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, avpc: ec2.IVpc, inst_sg: ec2.ISecurityGroup, ep_sg: ec2.ISecurityGroup, role: iam.IRole, akeyname: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const user_data = readFileSync('files/user_data_private.sh', 'utf-8');
    let vpcendpoint = new ec2.InterfaceVpcEndpoint(this, 'aVPCEndpoint', {
      service: { 
        name: 'com.amazonaws.'+ this.region+'.cloudformation',
        port: 443
      },
      vpc: avpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE },
      privateDnsEnabled: true,
      open: true,
      securityGroups: [ep_sg]
    });

    let cfnhup_restart_handle = new ec2.InitServiceRestartHandle()
    let private_asg = new autoscaling.AutoScalingGroup(this, 'PrivateInstanceASG', {
      role: role,
      vpc: avpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2,ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        edition: ec2.AmazonLinuxEdition.STANDARD,
        virtualization: ec2.AmazonLinuxVirt.HVM,
        storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE
      }),
      userData: ec2.UserData.custom(cdk.Fn.sub(user_data)),
      keyName: akeyname,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      desiredCapacity: 5,
      maxCapacity: 5,
      minCapacity: 5,
      signals: autoscaling.Signals.waitForAll({
        timeout: cdk.Duration.minutes(5)
      }),
      securityGroup: inst_sg 
    });
    let asg_logical_id = (private_asg.node.defaultChild as autoscaling.CfnAutoScalingGroup).logicalId;
    private_asg.applyCloudFormationInit(
      ec2.CloudFormationInit.fromConfigSets({
        configSets:{
          "configSet1":["config_step_1","config_step_2"],
          "configSet2":["config_step_3","config_step_4"]
        },
        configs:{
          "config_step_1": new ec2.InitConfig(
            [ec2.InitPackage.yum("git")]
          ),
          "config_step_2": new ec2.InitConfig(
            [ec2.InitCommand.shellCommand("echo config_step_2: "+asg_logical_id)]
          ),
          "config_step_3": new ec2.InitConfig(
            [ec2.InitCommand.shellCommand("echo config_step_3")]
          ),
          "config_step_4": new ec2.InitConfig(
            [ec2.InitCommand.shellCommand("echo config_step_4")]
          )
        }
      }),
      {
        configSets: ["configSet1","configSet2"],
        printLog: true,
        ignoreFailures: true
      }
    );
    new cdk.CfnOutput(this, "Output", {
      value: "logical resource id of asg:"+asg_logical_id
    });
  }
}
