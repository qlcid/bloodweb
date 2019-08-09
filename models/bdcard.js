//bdcard 테이블과 mapping되는 model 생성
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('bdcard', {
        serial_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        blood_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        blood_dona_type: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        blood_bank_name: { 
            type: DataTypes.STRING(50),
            allowNull: false,
        }, 
        is_donated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        reg_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        used_place:{
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
        },
        donater:{
            type:DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
        },
        dona_date:{
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        }
    }, {
        timestamps: false,
    });
};