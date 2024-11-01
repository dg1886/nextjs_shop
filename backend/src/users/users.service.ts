import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import * as bcrypt from 'bcrypt';
import {User} from "./users.model";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) {}

    findOneUser(filter: {
        where: {id?: string; username?: string; email?: string};
    }): Promise<User> {
        // return this.userModel.findOne({...filter});
        const whereClause: any = {};
        if (filter.where.id) whereClause.id = filter.where.id;
        if (filter.where.username) whereClause.username = filter.where.username;
        if (filter.where.email) whereClause.email = filter.where.email;

        return this.userModel.findOne({rejectOnEmpty: undefined, where: whereClause });
    }

    async create(createUserDto: CreateUserDto): Promise<User | {warningMessage: string}> {
        const user = new User();

        const existingByUserName = await this.findOneUser({
            where: {username: createUserDto.username},
        })

        const existingByEmail = await this.findOneUser({
            where: {email: createUserDto.email},
        })

        if(existingByUserName) {
            return {warningMessage: 'Пользователь с таким именем уже существует'}
        }
        if(existingByEmail) {
            return {warningMessage: 'Пользователь с таким email уже существует'}
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        user.username = createUserDto.username;
        user.password = hashedPassword;
        user.email = createUserDto.email;

        return user.save();
    }
}

