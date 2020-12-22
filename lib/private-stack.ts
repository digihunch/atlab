import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import autoscaling = require('@aws-cdk/aws-autoscaling')
// to do finish the private stack!
export class PrivateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, avpc: ec2.IVpc, inst_sg: ec2.ISecurityGroup, role: iam.IRole, akeyname: string, props?: cdk.StackProps) {
    super(scope, id, props)
    let vpcendpoint = new ec2.InterfaceVpcEndpoint(this, 'aVPCEndpoint', {
      service: { 
        name: 'com.amazonaws.'+ this.region+'.cloudformation',
        port: 443
      },
      vpc: avpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE },
      privateDnsEnabled: true,
      open: true,
      securityGroups: [inst_sg]
    })
    
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
      keyName: 'ss',
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      desiredCapacity: 5,
      maxCapacity: 5,
      minCapacity: 5,
      signals: autoscaling.Signals.waitForAll({
        timeout: cdk.Duration.minutes(5)
      }),
      securityGroup: inst_sg 
    });
    //let asg_logical_id = String(private_asg.node.defaultChild.logicalId)
  }
}
