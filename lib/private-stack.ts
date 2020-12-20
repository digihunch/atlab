import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import autoscaling = require('@aws-cdk/aws-autoscaling')
// to do finish the private stack!
export class PrivateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, avpc: ec2.IVpc, bstn_sg: ec2.ISecurityGroup, role: iam.IRole, akeyname: string, props?: cdk.StackProps) {
    super(scope, id, props)
    let vpcendpoint = new ec2.InterfaceVpcEndpoint(this, 'aVPCEndpoint', {
      vpc: avpc,
    });

    let private_asg 
  }
}
