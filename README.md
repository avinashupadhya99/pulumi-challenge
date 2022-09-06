# Pulumi Challenge

Source code for the Pulumi Challenge - [Startup in a Box](https://www.pulumi.com/challenge/startup-in-a-box/)

## Prerequisites

- [Pulumi Account](https://app.pulumi.com/signup)
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [AWS](https://aws.amazon.com/) account
- [Checkly](https://www.checklyhq.com/) account

## Instructions

```bash
npm install
```

```
# API KEY: https://app.checklyhq.com/settings/account/api-keys
pulumi config set checkly:apiKey --secret

# AccountID: https://app.checklyhq.com/settings/account/general
pulumi config set checkly:accountId

pulumi config set domainName

pulumi config set name-com-token --secret

pulumi config set name-com-user-name --secret

pulumi config set email --secret

pulumi config set address --secret
```

```
pulumi up
```