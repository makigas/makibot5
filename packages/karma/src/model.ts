import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class KarmaAction extends Model<
  InferAttributes<KarmaAction>,
  InferCreationAttributes<KarmaAction>
> {
  public actorType!: string;
  public actorId!: string;
  public type!: string;
  public originatorId!: string;
  public targetId!: string;
  public amount!: number;
  public created_at!: CreationOptional<Date>;
}

export function initKarmaModel(sequelize: Sequelize) {
  KarmaAction.init(
    {
      actorType: {
        field: "actor_type",
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      actorId: {
        field: "actor_id",
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        field: "type",
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      originatorId: {
        field: "originator_id",
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      targetId: {
        field: "target_id",
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      amount: {
        field: "amount",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
    },
    {
      tableName: "karma",
      createdAt: "created_at",
      updatedAt: false,
      sequelize,
    },
  );
}
