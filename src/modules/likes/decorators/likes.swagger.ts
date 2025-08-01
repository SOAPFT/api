import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  createErrorResponse,
  CommonAuthResponses,
  CommonErrorResponses,
} from '../../../decorators/swagger.decorator';

export function ApiCreateLike() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 좋아요 추가',
      description:
        '특정 게시글에 좋아요를 추가합니다. 이미 좋아요한 경우 에러가 발생합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'postUuid',
      description: '게시글 UUID',
      required: true,
      example: '01HZQK5J8X2M3N4P5Q6R7S8T9V',
    }),
    ApiResponse({
      status: 201,
      description: '좋아요가 성공적으로 추가됨',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 123,
            description: '생성된 좋아요 ID',
          },
          postUuid: {
            type: 'string',
            example: '01HZQK5J8X2M3N4P5Q6R7S8T9V',
            description: '좋아요된 게시글 UUID',
          },
          userUuid: {
            type: 'string',
            example: '01HZQK5J8X2M3N4P5Q6R7S8T9V',
            description: '좋아요한 사용자 UUID',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-06-22T12:00:00Z',
            description: '좋아요 생성 일시',
          },
        },
      },
    }),
    ApiResponse(
      createErrorResponse('LIKE_001', '이미 좋아요한 게시글입니다.', 400),
    ),
    ApiResponse(CommonAuthResponses.Unauthorized),
    ApiResponse(
      createErrorResponse('POST_001', '게시글을 찾을 수 없습니다.', 404),
    ),
    ApiResponse(CommonErrorResponses.ValidationFailed),
    ApiResponse(CommonErrorResponses.InternalServerError),
  );
}

export function ApiDeleteLike() {
  return applyDecorators(
    ApiOperation({
      summary: '좋아요 취소',
      description: '인증글의 좋아요를 취소합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'postUuid',
      description: '인증글 UUID',
      example: '01HZQK5J8X2M3N4P5Q6R7S8T9V',
    }),
    ApiResponse({
      status: 200,
      description: '좋아요가 성공적으로 취소됨',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '좋아요가 취소되었습니다.',
          },
        },
      },
    }),
    ApiResponse(
      createErrorResponse('LIKE_002', '좋아요하지 않은 인증글입니다.', 400),
    ),
    ApiResponse(CommonAuthResponses.Unauthorized),
    ApiResponse(
      createErrorResponse('POST_001', '인증글을 찾을 수 없습니다.', 404),
    ),
    ApiResponse(CommonErrorResponses.InternalServerError),
  );
}

export function ApiCheckLikeStatus() {
  return applyDecorators(
    ApiOperation({
      summary: '좋아요 상태 확인',
      description: '사용자가 특정 인증글에 좋아요를 했는지 확인합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'postUuid',
      description: '인증글 UUID',
      example: '01HZQK5J8X2M3N4P5Q6R7S8T9V',
    }),
    ApiResponse({
      status: 200,
      description: '좋아요 상태 조회 성공',
      schema: {
        type: 'object',
        properties: {
          isLiked: {
            type: 'boolean',
            example: true,
          },
          likeCount: {
            type: 'number',
            example: 42,
          },
          postUuid: {
            type: 'string',
            example: '01HZQK5J8X2M3N4P5Q6R7S8T9V',
          },
        },
      },
    }),
    ApiResponse(CommonAuthResponses.Unauthorized),
    ApiResponse(
      createErrorResponse('POST_001', '인증글을 찾을 수 없습니다.', 404),
    ),
    ApiResponse(CommonErrorResponses.InternalServerError),
  );
}
