import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { FindAllChallengesDto } from './dto/find-all-challenges.dto';
import { ChallengeFilterType } from '@/types/challenge.enum';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateChallenge,
  ApiGetAllChallenges,
  ApiGetChallenge,
  ApiUpdateChallenge,
  ApiJoinChallenge,
  ApiGetUserChallenges,
  ApiLeaveChallenge,
  ApiGetRecentChallenges,
  ApiGetUserCompletedChallengeCount,
  ApiGetPopularChallenges,
  ApiGetUserChallengeProgress,
  ApiSearchChallenges,
  ApiGetMonthlyChallengeStats,
  ApiGetChallengeVerificationStats,
  ApiGetChallengePostsForReview,
} from './decorators/challenges.swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserUuid } from '@/decorators/user-uuid.decorator';
import { ChallengeService } from './challenge.service';

@ApiTags('challenge')
@ApiBearerAuth('JWT-auth')
@Controller('challenge')
@UseGuards(JwtAuthGuard)
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  /**
   * 사용자가 참여한 챌린지 조회
   * @param userUuid 인증된 사용자 UUID
   * @returns 사용자가 참여한 챌린지 정보
   */
  @Get('user')
  @ApiGetUserChallenges()
  @ApiQuery({ name: 'status', enum: ChallengeFilterType, required: false })
  getUserChallenges(
    @UserUuid() userUuid: string,
    @Query('status') status?: ChallengeFilterType,
  ) {
    return this.challengeService.findUserChallenges(userUuid, status);
  }

  /**
   * 사용자가 성공한 챌린지 조회
   * @param userUuid 인증된 사용자 UUID
   * @returns 사용자가 참여한 챌린지 정보
   */
  @Get('successful')
  @ApiGetUserCompletedChallengeCount()
  getUserCompletedChallengeCount(@UserUuid() userUuid: string) {
    return this.challengeService.countUserCompletedChallenges(userUuid);
  }

  /**
   * 챌린지 생성
   * @param createChallengeDto 챌린지 생성 정보
   * @param userUuid 인증된 사용자 UUID
   * @returns 생성된 챌린지 정보
   */
  @Post()
  @ApiCreateChallenge()
  create(
    @Body() createChallengeDto: CreateChallengeDto,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.createChallenge(createChallengeDto, userUuid);
  }

  /**
   * 모든 챌린지 조회
   * @param findAllChallengesDto 조회 조건
   * @returns 모든 챌린지 정보
   */
  @Get()
  @ApiGetAllChallenges()
  findAll(@Query() findAllChallengesDto: FindAllChallengesDto) {
    return this.challengeService.findAllChallenges(findAllChallengesDto);
  }

  /**
   * 최근 생성된 챌린지 목록
   * @returns 최근 생성된 챌린지 목록
   */

  @Get('recent')
  @ApiGetRecentChallenges()
  getRecentChallenges() {
    return this.challengeService.getRecentChallenges();
  }

  /**
   * 인기있는 챌린지 목록
   * @returns 최근 생성된 챌린지 목록
   */

  @Get('popular')
  @ApiGetPopularChallenges()
  getPopularChallenges() {
    return this.challengeService.getRecentChallenges();
  }

  /**
   * 챌린지 검색
   * @param keyword 검색 키워드
   * @param page 페이지 번호 (기본: 1)
   * @param limit 한 페이지당 결과 수 (기본: 10, 최대: 50)
   * @returns 키워드와 일치하거나 연관된 챌린지 목록
   */
  @Get('search')
  @ApiSearchChallenges()
  async searchChallenges(
    @Query('keyword') keyword: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.searchChallenges(
      keyword,
      Number(page),
      Number(limit),
      userUuid,
    );
  }

  /**
   * 챌린지 상세 조회
   * @param challengeId 챌린지 ID
   * @param userUuid 현재 로그인한 사용자의 UUID
   * @returns 챌린지 상세 정보
   */
  @Get(':challengeUuid')
  @ApiGetChallenge()
  findOne(
    @Param('challengeUuid') challengeUuid: string,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.findOneChallenge(challengeUuid, userUuid);
  }

  /**
   * 챌린지 수정
   * @param challengeId 챌린지 ID
   * @param updateChallengeDto 챌린지 수정 정보
   * @param userUuid 현재 로그인한 사용자의 UUID
   * @returns 수정된 챌린지 정보
   */
  @Patch(':challengeUuid')
  @ApiUpdateChallenge()
  update(
    @Param('challengeUuid') challengeUuid: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.updateChallenge(
      challengeUuid,
      updateChallengeDto,
      userUuid,
    );
  }

  /**
   * 챌린지 참여
   * @param challengeUuid 챌린지 Uuid
   * @param joinChallengeDto 참여 정보
   * @param userUuid 현재 로그인한 사용자의 UUID
   * @returns 참여된 챌린지 정보
   */
  @Post(':challengeUuid/join')
  @ApiJoinChallenge()
  joinChallenge(
    @Param('challengeUuid') challengeUuid: string,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.joinChallenge(challengeUuid, userUuid);
  }

  /**
   * 사용자 챌린지 진행률 조회
   * @param challengeUuid 조회할 챌린지 UUID
   * @param userUuid 현재 로그인한 사용자 UUID
   * @returns 주차별 진행 정보 및 전체 달성률
   */

  @Get(':challengeUuid/progress')
  @ApiGetUserChallengeProgress()
  getUserChallengeProgress(
    @Param('challengeUuid') challengeUuid: string,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.getUserChallengeProgress(
      userUuid,
      challengeUuid,
    );
  }

  /**
   * 챌린지 탈퇴
   * @param challengeId 챌린지 ID
   * @param userUuid 현재 로그인한 사용자의 UUID
   * @returns 탈퇴 메시지
   */
  @Delete(':challengeUuid/leave')
  @ApiLeaveChallenge()
  leaveChallenge(
    @Param('challengeUuid') challengeUuid: string,
    @UserUuid() userUuid: string,
  ) {
    return this.challengeService.leaveChallenge(challengeUuid, userUuid);
  }

  /**
   * 챌린지 월별 인증 현황 조회
   * @param challengeUuid 챌린지 UUID
   * @param year 조회할 연도
   * @param month 조회할 월
   * @returns 각 날짜별 인증 수와 인증한 사용자 리스트를 반환
   */
  @Get(':challengeUuid/stats')
  @ApiGetMonthlyChallengeStats()
  async getChallengeMonthlyStats(
    @Param('challengeUuid') challengeUuid: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.challengeService.getMonthlyChallengeStats(
      challengeUuid,
      parseInt(year),
      parseInt(month),
    );
  }

  /**
   * 챌린지 검증 상태 통계 조회
   * @param challengeUuid 챌린지 UUID
   * @returns 검증 상태별 통계
   */
  @Get(':challengeUuid/verification-stats')
  @ApiGetChallengeVerificationStats()
  async getChallengeVerificationStats(
    @Param('challengeUuid') challengeUuid: string,
  ) {
    return this.challengeService.getChallengeVerificationStats(challengeUuid);
  }

  /**
   * 챌린지의 검토 필요한 인증글 목록 조회
   * @param challengeUuid 챌린지 UUID
   * @param page 페이지 번호
   * @param limit 페이지당 개수
   * @returns 검토 필요한 인증글 목록
   */
  @Get(':challengeUuid/review')
  @ApiGetChallengePostsForReview()
  async getChallengePostsForReview(
    @Param('challengeUuid') challengeUuid: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.challengeService.getChallengePostsForReview(
      challengeUuid,
      Number(page),
      Number(limit),
    );
  }
}
