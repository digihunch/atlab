import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');


export class SecurityStack extends cdk.Stack {
  public bastion_sg: ec2.ISecurityGroup;
  public private_sg: ec2.ISecurityGroup;
  public endpoint_sg: ec2.ISecurityGroup;
  public instance_role: iam.IRole;

  constructor(scope: cdk.Construct, id: string, avpc: ec2.IVpc, props?: cdk.StackProps) {
    super(scope, id, props)
    let bastion_sg = new ec2.SecurityGroup(this, 'bastionsg', {
      securityGroupName: 'bastion-sg',
      description: 'SG for Bastion Host',
      allowAllOutbound: true,
      vpc: avpc
    });
    bastion_sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH");

    let private_sg = new ec2.SecurityGroup(this, 'privatesg', {
      securityGroupName: 'private-sg',
      description: 'SG for private instances',
      allowAllOutbound: true,
      vpc: avpc
    });
    private_sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH");
    private_sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allIcmp(), "SSH");

    let endpoint_sg = new ec2.SecurityGroup(this, 'endpointsg', {
      securityGroupName: 'endpoint-sg',
      description: 'SG for VPC endpoint',
      vpc: avpc,
      allowAllOutbound: true
    });
    endpoint_sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), "VCP endpoint uses TCP port 443") 

    let instance_role = new iam.Role(this, 'instancerole',{
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'ec2-role',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess')] 
    }); 

    instance_role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ec2:ImportKeyPair','ec2:CreateKeyPair','ec2:DescribeKeyPairs'],
      resources: ['*']
    }));
  }    
}
