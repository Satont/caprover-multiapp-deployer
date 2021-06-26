export interface App {
  hasPersistentData: boolean;
  description: string;
  instanceCount: number;
  captainDefinitionRelativeFilePath: string;
  networks: string[];
  envVars: EnvVar[];
  volumes: any[];
  ports: any[];
  versions: Version[];
  deployedVersion: number;
  notExposeAsWebApp: boolean;
  customDomain: CustomDomain[];
  hasDefaultSubDomainSsl: boolean;
  forceSsl: boolean;
  websocketSupport: boolean;
  containerHttpPort: number;
  preDeployFunction: string;
  serviceUpdateOverride: string;
  appName: string;
  isAppBuilding: boolean;
}

export interface CustomDomain {
  publicDomain: string;
  hasSsl: boolean;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface Version {
  version: number;
  timeStamp: string;
  deployedImageName: string;
  gitHash: string;
}
