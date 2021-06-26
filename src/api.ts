/* eslint-disable no-extra-boolean-cast */

import got from 'got';
import { App } from './typings';

let token: string;
const defaultRequestOptions = {
  https: {
    rejectUnauthorized: false,
  },
  headers: {
    'x-namespace': 'captain',
    'x-captain-auth': undefined,
  },
  responseType: 'json',
};

export async function deployApps() {
  token = await getToken();
  defaultRequestOptions.headers['x-captain-auth'] = token;
  const apps = await getApps();

  for (const app of apps) {
    got.post(`${process.env.CAPROVER_ROOT}/api/v2/user/apps/appData/${app.appName}?detached=1`, {
      json: {
        captainDefinitionContent: JSON.stringify({
          schemaVersion: 2,
          imageName: process.env.DOCKER_IMAGE,
          gitHash: '',
        }),
      },
      ...(defaultRequestOptions as any),
    });
  }
}

async function getToken(): Promise<string> {
  const request = await got.post<Record<string, any>>(`${process.env.CAPROVER_ROOT}/api/v2/login`, {
    json: {
      password: process.env.CAPROVER_PASSWORD as string,
    },
    ...(defaultRequestOptions as any),
  });
  defaultRequestOptions.headers['x-captain-auth'] = token;
  return request.body.data.token;
}

async function getApps() {
  const request = await got.get<{ data: { appDefinitions: App[] } }>(`${process.env.CAPROVER_ROOT}/api/v2/user/apps/appDefinitions`, {
    ...(defaultRequestOptions as any),
  });

  const apps = request.body.data.appDefinitions.filter((a) => {
    if (!!process.env.POSTFIX) {
      return a.appName.endsWith(process.env.POSTFIX);
    } else {
      return false;
    }
  });

  return apps;
}
