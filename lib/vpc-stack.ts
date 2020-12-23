#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');

export class VpcStack extends cdk.Stack  {
    public vpc: ec2.IVpc;
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props)
      this.vpc = new ec2.Vpc(this, 'VPC', {
        cidr: '10.128.0.0/16',
        natGateways: 1,
        maxAzs: 2,
        subnetConfiguration: [
            {
              cidrMask: 24,
              name: 'Web',
              subnetType: ec2.SubnetType.PUBLIC
            },
            {
              cidrMask: 24,
              name: 'Application',
              subnetType: ec2.SubnetType.PRIVATE
            },
            {
              cidrMask: 24,
              name: 'Database',
              subnetType: ec2.SubnetType.ISOLATED
            }
        ]
    })
  }
}
