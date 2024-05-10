import { Address, Deployer } from "../web3webdeploy/types";
import {
  TasksDeployment,
  deploy as tasksDeploy,
} from "../lib/openrd/deploy/deploy";
import { DeployRFPsSettings, deployRFPs } from "./internal/RFPs";

export interface RFPsDeploymentSettings {
  tasksDeployment: TasksDeployment;
  rfpsDeploymentSettings: Omit<DeployRFPsSettings, "tasks">;
  forceRedeploy?: boolean;
}

export interface RFPsDeployment {
  RFPs: Address;
}

export async function deploy(
  deployer: Deployer,
  settings?: RFPsDeploymentSettings
): Promise<RFPsDeployment> {
  if (settings?.forceRedeploy !== undefined && !settings.forceRedeploy) {
    const existingDeployment = await deployer.loadDeployment({
      deploymentName: "latest.json",
    });
    if (existingDeployment !== undefined) {
      return existingDeployment;
    }
  }

  deployer.startContext("lib/openrd");
  const taskDeployment =
    settings?.tasksDeployment ?? (await tasksDeploy(deployer));
  deployer.finishContext();

  const RFPs = await deployRFPs(deployer, {
    ...(settings?.rfpsDeploymentSettings ?? {}),
    tasks: taskDeployment.tasks,
  });

  const deployment: RFPsDeployment = {
    RFPs: RFPs,
  };
  await deployer.saveDeployment({
    deploymentName: "latest.json",
    deployment: deployment,
  });
  return deployment;
}
