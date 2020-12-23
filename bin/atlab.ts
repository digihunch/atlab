#!/usr/bin/env node
//import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import { VpcStack } from '../lib/vpc-stack';
import { SecurityStack } from '../lib/security-stack';
import { BastionStack } from '../lib/bastion-stack';
import { PrivateStack } from '../lib/private-stack'

const app = new cdk.App()
const vpcStack = new VpcStack(app, 'VpcStack')
const secStack = new SecurityStack(app, 'SecurityStack', vpcStack.vpc)
const bastionStack = new BastionStack(app, 'BastionStack', vpcStack.vpc, secStack.bastion_sg, secStack.instance_role)
const privateStack = new PrivateStack(app, 'PrivateStack', vpcStack.vpc, secStack.private_sg, secStack.endpoint_sg, secStack.instance_role, bastionStack.pubkey)
//bastionStack.addDependency(secStack)
//privateStack.addDependency(bastionStack)
//privateStack.addDependency(secStack)

app.synth()
