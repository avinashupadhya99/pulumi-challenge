import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();
const nameComUserName = config.require("name-com-user-name");
const nameComToken = config.require("name-com-token");

const domainNameRE = /{domainName}/gi;
const nameComUrl: string =
  "https://api.name.com/v4/domains/{domainName}:setNameservers";

interface NameComContact {
    firstName: string;
    lastName: string;
    companyName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    fax: string;
    email: string;
}

interface NameComContacts {
    registrant: NameComContact;
    admin: NameComContact;
    tech: NameComContact;
    billing: NameComContact;
}

interface SetNSInputs {
    domainName: string;
    nameservers: string[];
}

interface SetNSResponse extends SetNSInputs {
  contacts: NameComContacts;
  privacyEnabled: boolean;
  locked: boolean;
  autorenewEnabled: boolean;
  expireDate: string;
  createDate: string;
  renewalPrice: number;
}

class NameComProvider implements pulumi.dynamic.ResourceProvider {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  async create(props: SetNSInputs): Promise<pulumi.dynamic.CreateResult> {
    const got = (await import("got")).default;

    let data = await got
      .post(nameComUrl.replace(domainNameRE, props.domainName), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(nameComUserName+":"+nameComToken, 'binary').toString('base64')}`
        },
        json: {
            nameservers: props.nameservers
        },
      })
      .json<SetNSResponse>();

    return { id: data.domainName, outs: data };
  }
}

export class NameComNameServer extends pulumi.dynamic.Resource {
  constructor(
    name: string,
    props: SetNSInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(new NameComProvider(name), name, props, opts);
  }
}