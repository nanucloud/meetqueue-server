import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`사용자 ID ${id}를 찾을 수 없습니다.`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    
    // 비밀번호 해싱 처리
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(createUserDto.password, salt);
    
    return this.userRepository.create(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.email) user.email = updateUserDto.email;
    
    // 비밀번호 변경 시 해싱 처리
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    const updatedUser = await this.userRepository.update(id, user);
    if (!updatedUser) {
      throw new NotFoundException(`사용자 ID ${id} 업데이트에 실패했습니다.`);
    }
    
    return updatedUser;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<User | null> {
    const user = await this.findById(userId);
    user.refreshToken = refreshToken;
    return this.userRepository.update(userId, user);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // 존재 확인
    await this.userRepository.delete(id);
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }
}
