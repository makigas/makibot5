import { Sequelize } from "sequelize";
import { initKarmaModel } from "./model.js";
export { MemberKarma, KarmaBank, KarmaLoot } from "./manager.js";

export async function initDatabase(path: string) {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path,
    logging: false,
  });
  initKarmaModel(sequelize);
  await sequelize.authenticate();
  await sequelize.sync();
  return sequelize;
}
