import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';

export function ApiCreatePost() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 게시글 생성',
      description: '게시글 생성 정보를 받아 새로운 게시글을 생성합니다.',
    }),
    ApiBody({
      type: CreatePostDto,
    }),
    ApiResponse({
      status: 201,
      description: '게시글 생성 성공',
      schema: {
        example: {
          message: '게시물이 생성되었습니다.',
          post: {
            id: 1,
            postUuid: '01JZ13GQ31DJAY0GVF5F69HEH1',
            title: '제목 예시',
            userUuid: '01JZ13GQ31DJAY0GVF5F69HEH1',
            challengeUuid: '01JZ13GQ31DJAY0GVF5F69HEH2',
            content: '내용 예시',
            imageUrl: ['https://example.com/image1.jpg'],
            isPublic: true,
            createdAt: '2025-07-02T09:00:00.000Z',
            updatedAt: '2025-07-02T09:00:00.000Z',
          },
        },
      },
    }),
  );
}

export function ApiUpdatePost() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 수정',
      description: '게시글을 수정합니다. 작성자 본인만 수정할 수 있습니다.',
    }),
    ApiParam({
      name: 'postUuid',
      type: String,
      description: '수정할 게시글 UUID',
      example: '01JZ13GQ31DJAY0GVF5F69HEH2',
    }),
    ApiBody({
      type: UpdatePostDto,
      description: '수정할 게시글 정보',
      examples: {
        default: {
          summary: '게시글 수정 예시',
          value: {
            title: '오늘의 인증글 제목 수정',
            content: '오늘은 이렇게 운동했습니다. 수정본!',
            imageUrl: ['https://example.com/image1.jpg'],
            isPublic: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '게시글 수정 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: '게시글이 수정되었습니다.' },
          post: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              postUuid: {
                type: 'string',
                example: '01JZ13GQ31DJAY0GVF5F69HEH2',
              },
              title: { type: 'string', example: '오늘의 인증글 제목 수정' },
              content: {
                type: 'string',
                example: '오늘은 이렇게 운동했습니다. 수정본!',
              },
              imageUrl: {
                type: 'array',
                items: {
                  type: 'string',
                  example: 'https://example.com/image1.jpg',
                },
              },
              isPublic: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'POST_001: 해당 게시글이 없습니다.',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'POST_001' },
          message: { type: 'string', example: '해당 게시글이 없습니다.' },
          timestamp: { type: 'string', format: 'date-time' },
          details: {
            type: 'object',
            properties: {
              postUuid: {
                type: 'string',
                example: '01JZ13GQ31DJAY0GVF5F69HEH2',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'POST_002: 해당 포스트에 접근할 수 없습니다.',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'POST_002' },
          message: {
            type: 'string',
            example: '해당 포스트에 접근할 수 없습니다.',
          },
          timestamp: { type: 'string', format: 'date-time' },
          details: {},
        },
      },
    }),
  );
}

export function ApiGetMyPosts() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 게시글 조회 (페이지네이션)',
      description:
        '현재 로그인한 사용자의 게시글 목록을 페이지네이션으로 조회합니다.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiResponse({
      status: 200,
      description: '조회 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: '사용자 게시글 조회 성공' },
          total: { type: 'number', example: 25 },
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 10 },
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                postUuid: {
                  type: 'string',
                  example: '01JZ13GQ31DJAY0GVF5F69HEH2',
                },
                title: { type: 'string', example: '오늘의 인증글 제목' },
                content: { type: 'string', example: '인증글 내용' },
                imageUrl: {
                  type: 'array',
                  items: {
                    type: 'string',
                    example: 'https://example.com/image.jpg',
                  },
                },
                isPublic: { type: 'boolean', example: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    }),
  );
}

// 게시글 상세 조회
export function ApiGetPostDetail() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 상세 조회',
      description: '게시글의 상세 내용을 조회합니다.',
    }),
    ApiParam({
      name: 'postUuid',
      description: '조회할 게시글 ULID',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '게시글 상세 조회 성공',
      schema: {
        example: {
          message: '게시글 상세 조회 성공',
          post: {
            id: 2,
            postUuid: '01JZ5ZE1BANYQXND8XX8DESPXM',
            title: '오늘의 인증글 제목',
            challengeUuid: '01JZ13GQ31DJAY0GVF5F69HEH2',
            content: '오늘 헬스장에서 3시간 운동했어요! 💪',
            imageUrl: [
              'https://soapft-bucket.s3.amazonaws.com/images/workout2.jpg',
            ],
            isPublic: true,
            createdAt: '2025-07-02T16:27:33.105Z',
            updatedAt: '2025-07-02T16:40:59.340Z',
            userUuid: '01JYKVN18MCW5B9FZ1PP7T14XS',
            isMine: true,
            views: 10,
            user: {
              userUuid: '01JYKVN18MCW5B9FZ1PP7T14XS',
              nickname: '헬스왕',
              profileImage: 'https://example.com/profile.jpg',
            },
            likeCount: 0,
            isLiked: false,
            suspicionCount: 1,
            isSuspicious: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'POST_001: 해당 게시글이 없습니다.',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'POST_001' },
          message: { type: 'string', example: '해당 게시글이 없습니다.' },
          timestamp: { type: 'string', format: 'date-time' },
          details: {
            type: 'object',
            properties: {
              postUuid: {
                type: 'string',
                example: '01JZ13GQ31DJAY0GVF5F69HEH2',
              },
            },
          },
        },
      },
    }),
  );
}

// 게시글 삭제
export function ApiDeletePost() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 삭제',
      description: '특정 게시글을 삭제합니다.',
    }),
    ApiParam({
      name: 'postUuid',
      description: '삭제할 게시글 ULID',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '게시글 삭제 성공',
      schema: {
        example: {
          message: '게시글이 삭제되었습니다.',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'POST_001: 해당 게시글을 찾을 수 없습니다.',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'POST_001' },
          message: {
            type: 'string',
            example: '해당 게시글을 찾을 수 없습니다.',
          },
          timestamp: { type: 'string', format: 'date-time' },
          details: { type: 'object' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'POST_002: 해당 포스트에 접근할 수 없습니다.',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'POST_002' },
          message: {
            type: 'string',
            example: '해당 포스트에 접근할 수 없습니다.',
          },
          timestamp: { type: 'string', format: 'date-time' },
          details: { type: 'object' },
        },
      },
    }),
  );
}

/**
 * userUuid로 사용자 게시글 조회 API
 */
export function ApiGetUserPosts() {
  return applyDecorators(
    ApiOperation({ summary: '특정 사용자 게시글 목록 조회' }),
    ApiParam({ name: 'userUuid', description: '사용자 UUID', type: String }),
    ApiQuery({
      name: 'page',
      required: false,
      description: '페이지 번호',
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: '페이지당 개수',
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: '사용자 게시글 목록 조회 성공',
      schema: {
        example: {
          message: '사용자 게시글 목록 조회 성공',
          total: 12,
          page: 1,
          limit: 10,
          posts: [
            {
              id: 1,
              postUuid: '01JZ....',
              title: '인증글 제목',
              content: '오늘은 이렇게 운동했습니다.',
              imageUrl: ['https://example.com/image.jpg'],
              isPublic: true,
              createdAt: '2025-07-02T12:34:56Z',
              updatedAt: '2025-07-02T12:34:56Z',
            },
          ],
        },
      },
    }),
  );
}

// 챌린지 게시글 목록
export function ApiGetPostsByChallenge() {
  return applyDecorators(
    ApiOperation({
      summary: '챌린지 게시글 목록 조회',
      description: '특정 챌린지의 게시글을 페이지네이션으로 조회합니다.',
    }),
    ApiParam({
      name: 'challengeUuid',
      description: '조회할 챌린지 UUID',
      type: String,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: '페이지 번호 (기본값: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '페이지당 항목 수 (기본값: 10)',
    }),
    ApiResponse({
      status: 200,
      description: '챌린지 게시글 목록 조회 성공',
      schema: {
        example: {
          message: '챌린지 게시글 목록 조회 성공',
          total: 100,
          page: 1,
          limit: 10,
          posts: [
            {
              id: 1,
              postUuid: '01JZ644RN20G8VEFSNY09069AD',
              title: '오늘의 인증글',
              userUuid: '01JYKVN18MCW5B9FZ1PP7T14XS',
              challengeUuid: '01JZ644RN20G8VEFSNY09069AD',
              content: '오늘 헬스장에서 3시간 운동했어요! 💪',
              imageUrl: ['https://example.com/image.jpg'],
              isPublic: true,
              views: 10,
              createdAt: '2025-07-02T16:27:33.105Z',
              updatedAt: '2025-07-02T16:40:59.340Z',
              user: {
                userUuid: '01JYKVN18MCW5B9FZ1PP7T14XS',
                nickname: '사용자닉네임',
                profileImage: 'https://example.com/profile.jpg',
              },
            },
          ],
        },
      },
    }),
  );
}

export function ApiGetMyCalendar() {
  return applyDecorators(
    ApiOperation({
      summary: '내 달력 조회',
      description: '자신의 인증글 달력 데이터를 조회합니다.',
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: Number,
      example: 2025,
      description: '조회할 연도',
    }),
    ApiQuery({
      name: 'month',
      required: true,
      type: Number,
      example: 7,
      description: '조회할 월 (1~12)',
    }),
    ApiResponse({
      status: 200,
      description: '달력 조회 성공',
      schema: {
        example: {
          data: [
            {
              date: '2025-07-02',
              posts: [
                {
                  postUuid: '01JZFP44NM9XPNFQRQF4CHE9A6',
                  thumbnailUrl:
                    'https://cdn.example.com/images/post1-thumb.jpg',
                },
              ],
            },
            {
              date: '2025-07-04',
              posts: [
                {
                  postUuid: '01JZFP44NM9XPNFQRQF4CHE9B7',
                  thumbnailUrl:
                    'https://cdn.example.com/images/post2-thumb.jpg',
                },
              ],
            },
          ],
        },
      },
    }),
  );
}

export function ApiGetOtherCalendar() {
  return applyDecorators(
    ApiOperation({
      summary: '다른 사용자 달력 조회',
      description: '특정 사용자의 인증글 달력 데이터를 조회합니다.',
    }),
    ApiParam({
      name: 'userUuid',
      required: true,
      type: String,
      example: '01HYXXXXXXX',
      description: '조회할 사용자 UUID',
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: Number,
      example: 2025,
      description: '조회할 연도',
    }),
    ApiQuery({
      name: 'month',
      required: true,
      type: Number,
      example: 7,
      description: '조회할 월 (1~12)',
    }),
    ApiResponse({
      status: 200,
      description: '달력 조회 성공',
      schema: {
        example: {
          data: [
            {
              date: '2025-07-02',
              posts: [
                {
                  postUuid: '01JZFP44NM9XPNFQRQF4CHE9A6',
                  thumbnailUrl:
                    'https://cdn.example.com/images/post1-thumb.jpg',
                },
              ],
            },
            {
              date: '2025-07-04',
              posts: [
                {
                  postUuid: '01JZFP44NM9XPNFQRQF4CHE9B7',
                  thumbnailUrl:
                    'https://cdn.example.com/images/post2-thumb.jpg',
                },
              ],
            },
          ],
        },
      },
    }),
  );
}

export function ApiReportSuspicion() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 의심 등록',
      description:
        '게시글이 챌린지와 무관하거나 부적절할 경우 신고할 수 있습니다.',
    }),
    ApiParam({
      name: 'postUuid',
      required: true,
      type: String,
      example: '01JZPOSTUUIDEXAMPLE123',
      description: '의심하려는 게시글 UUID',
    }),
    ApiResponse({
      status: 201,
      description: '의심 등록 성공',
      schema: {
        example: {
          message: '의심 등록 완료',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '이미 의심 등록된 게시글입니다.',
    }),
  );
}

export function ApiGetPostVerificationStatus() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 AI 검증 상태 조회',
      description: '특정 게시글의 AI 검증 상태와 분석 결과를 조회합니다.',
    }),
    ApiParam({
      name: 'postUuid',
      type: String,
      description: '조회할 게시글 UUID',
      example: '01JZZP4T40RB3H2SP70PKBJWNR',
    }),
    ApiResponse({
      status: 200,
      description: '검증 상태 조회 성공',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '게시글 검증 상태 조회 성공',
          },
          data: {
            type: 'object',
            properties: {
              postUuid: {
                type: 'string',
                example: '01JZZP4T40RB3H2SP70PKBJWNR',
              },
              verificationStatus: {
                type: 'string',
                enum: ['pending', 'approved', 'rejected', 'review'],
                example: 'approved',
                description:
                  '검증 상태 (pending: 대기중, approved: 승인됨, rejected: 거부됨, review: 검토 필요)',
              },
              aiConfidence: {
                type: 'number',
                example: 0.85,
                description: 'AI 신뢰도 점수 (0-1 사이)',
              },
              aiAnalysisResult: {
                type: 'string',
                example:
                  '이미지에서 러닝화와 GPS 앱이 확인되어 러닝 챌린지와 관련성이 높습니다.',
                description: 'AI 분석 결과 설명',
              },
              verifiedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-27T10:30:00.000Z',
                description: '검증 완료 시간',
              },
              images: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    imageUrl: {
                      type: 'string',
                      example: 'https://example.com/image.jpg',
                    },
                    verificationStatus: {
                      type: 'string',
                      enum: ['pending', 'approved', 'rejected', 'review'],
                      example: 'approved',
                    },
                    confidence: {
                      type: 'number',
                      example: 0.85,
                    },
                    analysisResult: {
                      type: 'string',
                      example: '러닝화 이미지가 명확하게 식별되었습니다.',
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '게시글을 찾을 수 없음',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'POST_001' },
          message: { type: 'string', example: '해당 게시글이 없습니다.' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
      schema: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'SYS_001' },
          message: { type: 'string', example: '서버 오류가 발생했습니다.' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
}
