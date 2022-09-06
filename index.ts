import { CdnWebsite } from "./cdn-website";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
let config = new pulumi.Config();
let domainName = config.require("domainName");
let email = config.require("email");
let address = config.require("address");
const subDomain = "pulumi-challenge";

const eastRegion = new aws.Provider("east", {
  profile: aws.config.profile,
  region: "us-east-1", // Per AWS, ACM certificate must be in the us-east-1 region.
});

const route53Zone = new aws.route53.Zone(domainName, {
  name: domainName
});

const certificateConfig: aws.acm.CertificateArgs = {
  domainName: domainName,
  validationMethod: "DNS",
  subjectAlternativeNames: [`${subDomain}.${domainName}`],
};

const acmCertificate = new aws.acm.Certificate(domainName + " certificate", certificateConfig, { provider: eastRegion });

const hostedZoneId = route53Zone.zoneId;

const certificateValidationDomain = new aws.route53.Record(`${domainName}-validation`, {
  name: acmCertificate.domainValidationOptions[0].resourceRecordName,
  zoneId: hostedZoneId,
  type: acmCertificate.domainValidationOptions[0].resourceRecordType,
  records: [acmCertificate.domainValidationOptions[0].resourceRecordValue],
  ttl: 3600,
});

const subdomainCertificateValidationDomain = new aws.route53.Record(`${domainName}-validation2`, {
  name: acmCertificate.domainValidationOptions[1].resourceRecordName,
  zoneId: hostedZoneId,
  type: acmCertificate.domainValidationOptions[1].resourceRecordType,
  records: [acmCertificate.domainValidationOptions[1].resourceRecordValue],
  ttl: 3600,
});

const certificateValidation = new aws.acm.CertificateValidation("certificateValidation", {
  certificateArn: acmCertificate.arn,
  validationRecordFqdns: [certificateValidationDomain.fqdn, subdomainCertificateValidationDomain.fqdn],
}, { provider: eastRegion });

const nameServers = route53Zone.nameServers;

import { NameComNameServer } from "./name.com";

nameServers.apply(NameServers => {
  console.log(NameServers);

  const nameComNameServers = new NameComNameServer(domainName + " name.com NS", {
    domainName: domainName,
    nameservers: NameServers
  });
});

const website = new CdnWebsite("your-startup", {
  subDomain: "pulumi-challenge",
  domainName: domainName,
  route53ZoneID: route53Zone.zoneId,
  acmCertificateARN: certificateValidation.certificateArn
});

const websiteUrl: string = subDomain + "." + domainName;

export const CDNUrl = website.url;

// Monitoring with Checkly
// Demonstrates Standard Package usage
import * as checkly from "@checkly/pulumi";
import * as fs from "fs";

const emailChannel = new checkly.AlertChannel("personal-email-channel", {
  email: {
    address: process.env.EMAIL || ""
  }
});

new checkly.Check("index-page", {
  activated: true,
  frequency: 10,
  type: "BROWSER",
  locations: ["ap-south-1"],
  script: 
    fs
      .readFileSync("checkly-embed.js")
      .toString("utf8")
      .replace("{{websiteUrl}}", websiteUrl),
  alertChannelSubscriptions: [
    {
      activated: true,
      channelId: emailChannel.id.apply((id: string) => parseInt(id)),
    }
  ]
});



import { Swag } from "./swag-provider";

const swag = new Swag("avinash-startup", {
  name: "Avinash Upadhyaya",
  email: email,
  address: address,
  size: "L",
});