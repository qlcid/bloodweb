//reqboard 테이블과 mapping되는 model 생성
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('reqboard', {
        diagnosis: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        need_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        story: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
        },
        is_finished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        reg_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        used_place:{
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        donated_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: false,
    });
};