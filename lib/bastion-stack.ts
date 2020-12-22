import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');


export class BastionStack extends cdk.Stack {
  public pubkey: string;
  constructor(scope: cdk.Construct, id: string, avpc: ec2.IVpc, bstn_sg: ec2.ISecurityGroup, role: iam.IRole, props?: cdk.StackProps) {
    super(scope, id, props)
    let bastion_host = new ec2.Instance(this,'bastion-host', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2,ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        edition: ec2.AmazonLinuxEdition.STANDARD,
        virtualization: ec2.AmazonLinuxVirt.HVM,
        storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE
      }),
      vpc: avpc,
      role: role,
      keyName: 'cskey',
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: bstn_sg
    });
    this.pubkey = bastion_host.instanceId + '-pubkey'
  }
}
