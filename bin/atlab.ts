#!/usr/bin/env node
//import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import { VpcStack } from '../lib/vpc-stack';
import { SecurityStack } from '../lib/security-stack';
import { BastionStack } from '../lib/bastion-stack';

const app = new cdk.App()
const vpcStack = new VpcStack(app, 'VpcStack')
const secStack = new SecurityStack(app, 'SecurityStack', vpcStack.vpc)
const bastionStack = new BastionStack(app, 'BastionStack', vpcStack.vpc, secStack.bastion_sg, secStack.instance_role)

app.synth()
