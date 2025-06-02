import { Auth } from '@/entities/auth.entity';
import { User } from '@/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '@/entities/post.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserStatusType } from '@/types/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  findOneBySocialId(socialId: string) {
    return this.userRepository.findOneBy({ socialId });
  }

  createUser(user, uuid): Promise<User> {
    const newUser = this.userRepository.create({
      userUuid: uuid,
      nickname: user.nickname,
      socialNickname: user.socialNickname,
      profileImage: user.profileImage,
      socialProvider: user.socialProvider,
      socialId: user.socialId,
      status: UserStatusType.ACTIVE,
    });
    return this.userRepository.save(newUser);
  }

  /**
   * userUuid로 userId 조회
   * @param userUuid 사용자 UUID
   * @returns 사용자 ID
   */
  async getUserIdByUuid(userUuid: string): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { userUuid },
      select: ['id'],
    });

    if (!user) {
      throw new NotFoundException(
        `UUID ${userUuid}에 해당하는 사용자를 찾을 수 없습니다.`,
      );
    }

    return user.id;
  }

  async logout(userUuid: string) {
    const userId = await this.getUserIdByUuid(userUuid);
    await this.authRepository.update(
      { userId },
      {
        refreshToken: null,
      },
    );

    return {
      message: '로그아웃 성공',
    };
  }

  /*
  닉네임, 소개글 변경
  */
  async updateProfile(userUuid: string, dto: UpdateProfileDto) {
    const { newNickname, newIntroduction, newProfileImg } = dto;

    const user = await this.userRepository.findOneBy({ userUuid });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (newNickname !== undefined) {
      user.nickname = newNickname;
    }
    if (newIntroduction !== undefined) {
      user.introduction = newIntroduction;
    }
    if (newProfileImg !== undefined) {
      user.profileImage = newProfileImg;
    }

    await this.userRepository.save(user);

    return { message: '프로필이 수정되었습니다.' };
  }

  async checkUserExists(userUuid: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { userUuid } });
    return !!user;
  }

  async getUserByIds(idArray: string[]) {
    const users = await Promise.all(
      idArray.map(async (id) => {
        const user = await this.userRepository.findOneBy({ userUuid: id });
        return user;
      }),
    );

    return users.filter((user) => user !== null);
  }

  // 회원 탈퇴
  async deleteUser(userUuid: string) {
    const user = await this.userRepository.findOneBy({ userUuid });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    user.status = UserStatusType.DELETE;
    user.nickname = null;
    user.profileImage = null;

    await this.userRepository.save(user);

    return { message: '회원 탈퇴 성공!' };
  }

  async getUserInfo(userUuid: string) {
    const user = await this.userRepository.findOne({
      where: { userUuid },
    });
    return {
      userName: user.nickname,
      userImage: user.profileImage,
      userIntroduction: user.introduction,
    };
  }
}
