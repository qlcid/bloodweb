create table user(
	user_id					varchar(20)	not null	primary key,
    user_pwd				varchar(20) not null,
    flag					tinyint(1)	not null,
    business_license_num	char(12) 	null,
    user_name				varchar(10)	not null,
    nickname				varchar(20) not null,
    dona_count				int			not null	default 0,
    class					varchar(10)	not null	default '브론즈',
    reg_date				datetime 	not null	default current_timestamp
)