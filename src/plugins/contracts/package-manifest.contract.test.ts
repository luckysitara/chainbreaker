import { describePackageManifestContract } from "../../../test/helpers/plugins/package-manifest-contract.js";

type PackageManifestContractParams = Parameters<typeof describePackageManifestContract>[0];

const packageManifestContractTests: PackageManifestContractParams[] = [
  {
    runtimeDeps: ["@buape/carbon", "https-proxy-agent"],
  },
  {
    pluginId: "feishu",
    runtimeDeps: ["@larksuiteoapi/node-sdk"],
  },
  {
    pluginId: "memory-lancedb",
    runtimeDeps: ["@lancedb/lancedb"],
  },
  { pluginId: "telegram", runtimeDeps: ["grammy"] },
  {
    pluginId: "whatsapp",
    runtimeDeps: ["@whiskeysockets/baileys", "jimp"],
  },
];

for (const params of packageManifestContractTests) {
  describePackageManifestContract(params);
}
