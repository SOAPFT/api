import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Comment } from '@/entities/comment.entity';
import { Post } from '@/entities/post.entity';
import { User } from '@/entities/user.entity';
import { Group } from '@/entities/group.entity';
import { Logger } from 'winston';
import { LoggerService } from '@/utils/logger.service';

export class CommentSeeder implements Seeder {
  private readonly logger: Logger = LoggerService.getInstance().logger;

  public async run(dataSource: DataSource): Promise<void> {
    const commentRepository = dataSource.getRepository(Comment);
    const postRepository = dataSource.getRepository(Post);
    const userRepository = dataSource.getRepository(User);
    const groupRepository = dataSource.getRepository(Group);

    const posts = await postRepository.find();
    const users = await userRepository.find();
    const groups = await groupRepository.find();

    if (posts.length === 0 || users.length === 0) {
      this.logger.warn(
        '게시글 또는 사용자가 없습니다. 댓글 생성을 건너뜁니다.',
      );
      return;
    }

    // 사용자별 소속 그룹 매핑
    const userGroupMapping: { [userUuid: string]: string[] } = {};
    groups.forEach((group) => {
      group.memberUuid.forEach((memberUuid) => {
        if (!userGroupMapping[memberUuid]) {
          userGroupMapping[memberUuid] = [];
        }
        userGroupMapping[memberUuid].push(group.title);
      });
    });

    // 카테고리별 댓글 템플릿
    const commentTemplates = {
      // 홈트 관련 댓글
      홈트: [
        '집에서도 이렇게 열심히 하시는군요! 대단해요 👍',
        '홈트 루틴 공유해주세요!',
        '저도 홈트 시작해볼게요 💪',
        '꾸준함이 최고죠! 화이팅!',
        '어떤 운동 앱 사용하시나요?',
        '공간이 넓지 않아도 되나요?',
        '운동 매트 추천 부탁드려요',
        '30일 도전 저도 따라해볼게요!',
        '집에서 하는 게 이렇게 효과적이군요',
        '시간 절약되고 좋을 것 같아요',
      ],

      // 웨이트 관련 댓글
      웨이트: [
        '무게 몇 키로인가요?',
        '폼이 정말 좋아보여요!',
        '저도 벤치프레스 배우고 싶어요',
        '어떤 프로그램 따라하시나요?',
        '헬스장 분위기 좋아보이네요',
        '운동자세 꼼꼼히 봐주세요!',
        '점진적 과부하가 중요하죠',
        '단백질 섭취도 신경쓰세요',
        '근육량 늘고 있는 게 보여요',
        '오운완 인증 멋있어요 🔥',
      ],

      // 요가 관련 댓글
      요가: [
        '자세가 정말 우아해요 ✨',
        '유연성이 부러워요',
        '마음의 평화가 느껴져요',
        '요가 매트 어디서 구매하셨나요?',
        '호흡이 중요하다고 하던데',
        '명상 효과도 있을 것 같아요',
        '스트레스 해소에 좋겠네요',
        '어떤 요가 스타일인가요?',
        '초보도 따라할 수 있을까요?',
        '정말 힐링되는 것 같아요 🧘‍♀️',
      ],

      // 러닝 관련 댓글
      러닝: [
        '몇 킬로 뛰셨나요?',
        '페이스는 어느 정도인가요?',
        '새벽 러닝 정말 대단해요!',
        '한강 코스 좋죠',
        '운동화 추천해주세요',
        '러닝 어플 사용하시나요?',
        '날씨 좋을 때 뛰는 게 최고죠',
        '부상 조심하세요!',
        '목표 거리가 있으신가요?',
        '러닝 후 스트레칭 꼭 하세요',
      ],

      // 크로스핏 관련 댓글
      크로스핏: [
        'WOD 정말 힘들어 보여요',
        '전신운동 효과 짱이죠',
        '크로스핏 박스 어디인가요?',
        '컨디션 관리 어떻게 하시나요?',
        '체력이 정말 좋아지겠어요',
        '폼 체크 받으면서 하세요',
        '무리하지 마시고 점진적으로!',
        '땀범벅 되는 게 보여요 💦',
        '크로스핏 중독성 있죠',
        '팀워크도 느낄 수 있어서 좋아요',
      ],

      // 배드민턴 관련 댓글
      배드민턴: [
        '스매시 폼이 멋있어요!',
        '라켓 브랜드가 뭔가요?',
        '발놀림이 가벼워 보여요',
        '복식? 단식?',
        '셔틀콕 많이 드시겠어요',
        '백핸드 어려운데 잘하시네요',
        '체육관 바닥이 좋아보여요',
        '경기 결과 궁금해요',
        '다음에 같이 쳐요!',
        '운동량 많아서 좋겠어요',
      ],

      // 테니스 관련 댓글
      테니스: [
        '백핸드 배우고 싶어요',
        '라켓 스트링 교체 주기는?',
        '프로 경기 직관 부러워요',
        '테니스 레슨 받고 계신가요?',
        '코트 예약하기 어렵죠',
        '서브 연습 많이 하세요',
        '풋워크가 중요하다고 하던데',
        '테니스복 브랜드 추천해주세요',
        '실력 늘고 있는 게 보여요',
        '동호회 분위기 좋아보여요',
      ],

      // 다이어트 관련 댓글
      다이어트: [
        '식단 너무 건강해 보여요',
        '칼로리는 어느 정도인가요?',
        '의지력이 대단하세요',
        '요리도 잘하시네요',
        '단백질 비율이 좋아보여요',
        '맛없어 보이지 않아요!',
        '저도 따라해볼게요',
        '간식 참는 게 제일 힘들어요',
        '변화가 눈에 보여요',
        '목표 체중 있으신가요?',
      ],

      // 운동복 관련 댓글
      운동복: [
        '코디 너무 예뻐요!',
        '어디 브랜드인가요?',
        '기능성도 좋아보여요',
        '컬러 조합이 멋져요',
        '가격대가 궁금해요',
        '핏이 정말 좋네요',
        '운동할 때 편할 것 같아요',
        '온라인으로 구매하셨나요?',
        '사이즈 고민되는데 팁 있나요?',
        '세탁은 어떻게 하시나요?',
      ],

      // 프로틴 관련 댓글
      프로틴: [
        '맛이 어떤가요?',
        '가성비 좋아보여요',
        '하루에 몇 스쿱 드시나요?',
        '우유랑 먹으면 맛있죠',
        '근육량 늘고 있나요?',
        '소화는 잘 되시나요?',
        '다른 맛도 궁금해요',
        '운동 전후 언제 드시나요?',
        '추천 레시피 있나요?',
        '효과 느끼시나요?',
      ],

      // 수영 관련 댓글
      수영: [
        '몇 미터 하셨나요?',
        '어떤 영법인가요?',
        '수영복 추천해주세요',
        '수영모 벗으면 머리가...',
        '전신운동이라 좋죠',
        '관절에 무리 안 가서 좋아요',
        '오리발 효과 있나요?',
        '수영장 물이 깨끗해보여요',
        '강습 받으시나요?',
        '기록 측정하시나요?',
      ],

      // 필라테스 관련 댓글
      필라테스: [
        '코어 근육에 좋겠어요',
        '자세 교정 효과 있나요?',
        '호흡이 중요하다고 하던데',
        '선생님이 잘 가르쳐주시나요?',
        '소도구 사용법 배우고 싶어요',
        '유연성 늘고 있나요?',
        '매트 필라테스인가요?',
        '기구 필라테스도 해보세요',
        '몸의 변화 느끼시나요?',
        '집에서도 할 수 있는 동작 있나요?',
      ],

      // 바디프로필 관련 댓글
      바디프로필: [
        '몸매 정말 좋아요!',
        '식단 관리 어떻게 하시나요?',
        '운동 루틴 공유해주세요',
        '의지력이 대단하세요',
        '사진관 어디인가요?',
        '준비 기간이 얼마나 걸렸나요?',
        '컨디션 조절 힘들죠',
        '결과물이 기대돼요',
        '동기부여가 돼요',
        '다이어트 팁 알려주세요',
      ],

      // 스트레칭 관련 댓글
      스트레칭: [
        '부상 예방에 좋죠',
        '몸이 부드러워지겠어요',
        '어떤 스트레칭인가요?',
        '시간은 얼마나 하시나요?',
        '거북목에 도움될까요?',
        '요가랑 비슷한가요?',
        '운동 전후 꼭 해야죠',
        '라운드숄더 개선됐나요?',
        '폼롤러도 사용하세요',
        '유연성 테스트 해보세요',
      ],

      // 라이딩 관련 댓글
      라이딩: [
        '자전거 브랜드가 뭔가요?',
        '거리는 얼마나 가셨나요?',
        '코스가 좋아보여요',
        '안전장비 착용하세요',
        '바람 맞으며 달리는 게 시원하죠',
        '업힐 구간 힘들죠',
        '자전거 관리는 어떻게 하시나요?',
        '라이딩복 기능성 좋아보여요',
        '단체 라이딩 재밌겠어요',
        '경치 구경하며 운동하니 좋네요',
      ],

      // 클라이밍 관련 댓글
      클라이밍: [
        '난이도가 어느 정도인가요?',
        '클라이밍화 추천해주세요',
        '홀드 잡는 법 어려워요',
        '상체 근력 늘겠어요',
        '높이 올라가면 무섭지 않나요?',
        '문제 해결하는 재미가 있죠',
        '안전 확보 잘 하세요',
        '손목 보호대 사용하세요',
        '실내 클라이밍장인가요?',
        '정신력도 중요하겠어요',
      ],

      // 트레드밀 관련 댓글
      트레드밀: [
        '속도는 어느 정도인가요?',
        '경사도 올리면 더 힘들죠',
        '실내 운동이라 좋겠어요',
        '러닝머신 브랜드 뭔가요?',
        '지루하지 않나요?',
        '음악 들으면서 하시나요?',
        '무릎에 무리 없나요?',
        '칼로리 소모량이 궁금해요',
        '인터벌 트레이닝 해보세요',
        '꾸준히 하는 게 최고죠',
      ],
    };

    // 일반적인 격려/공감 댓글
    const generalComments = [
      '화이팅! 💪',
      '대단하세요!',
      '저도 동기부여 받고 갑니다',
      '꾸준함이 답이죠',
      '멋있어요!',
      '부러워요',
      '좋은 자극 받고 갑니다',
      '오늘도 수고하셨어요',
      '최고예요!',
      '응원할게요!',
      '건강이 최고죠',
      '체력이 국력!',
      '정말 멋져요',
      '저도 열심히 해야겠어요',
      '좋은 에너지 받아갑니다',
      '인증샷 보기 좋아요',
      '운동하는 모습이 멋있어요',
      '건강한 하루 보내세요',
      '오운완 축하드려요',
      '내일도 화이팅!',
    ];

    // 질문형 댓글
    const questionComments = [
      '몇 시간 운동하셨나요?',
      '초보도 따라할 수 있을까요?',
      '어려운 점은 없으셨나요?',
      '준비물이 따로 있나요?',
      '비용이 많이 드나요?',
      '시작하기 전에 알아야 할 게 있나요?',
      '부상 위험은 없나요?',
      '효과는 언제부터 느끼셨나요?',
      '다른 운동과 비교하면 어떤가요?',
      '추천하고 싶은 운동인가요?',
    ];

    // userUuid를 userId로 매핑하기 위한 Map 생성
    const userUuidToIdMap: { [uuid: string]: number } = {};
    users.forEach((user) => {
      userUuidToIdMap[user.userUuid] = user.id;
    });

    // postUuid를 postId로 매핑하기 위한 Map 생성
    const postUuidToIdMap: { [uuid: string]: number } = {};
    posts.forEach((post) => {
      postUuidToIdMap[post.id] = post.id;
    });

    const comments = [];

    // 각 게시글에 대해 댓글 생성
    for (const post of posts) {
      // 게시글당 0-8개의 댓글 랜덤 생성
      const commentCount = Math.floor(Math.random() * 9);

      // 게시글 작성자가 속한 그룹의 다른 멤버들이 댓글 작성
      const postAuthorGroups = userGroupMapping[post.userUuid] || [];
      let potentialCommenters: string[] = [];

      // 작성자와 같은 그룹의 멤버들 찾기
      groups.forEach((group) => {
        if (postAuthorGroups.includes(group.title)) {
          group.memberUuid.forEach((memberUuid) => {
            if (
              memberUuid !== post.userUuid &&
              !potentialCommenters.includes(memberUuid)
            ) {
              potentialCommenters.push(memberUuid);
            }
          });
        }
      });

      // 같은 그룹 멤버가 없으면 전체 사용자 중에서 선택
      if (potentialCommenters.length === 0) {
        potentialCommenters = users
          .filter((user) => user.userUuid !== post.userUuid)
          .map((user) => user.userUuid);
      }

      // 게시글 제목/내용을 기반으로 카테고리 추정
      let category = '일반';
      const postContent = `${post.title} ${post.content}`.toLowerCase();

      if (postContent.includes('홈트') || postContent.includes('집에서'))
        category = '홈트';
      else if (
        postContent.includes('웨이트') ||
        postContent.includes('헬스') ||
        postContent.includes('벤치') ||
        postContent.includes('오운완')
      )
        category = '웨이트';
      else if (postContent.includes('요가')) category = '요가';
      else if (postContent.includes('러닝') || postContent.includes('런닝'))
        category = '러닝';
      else if (postContent.includes('크로스핏')) category = '크로스핏';
      else if (postContent.includes('배드민턴')) category = '배드민턴';
      else if (postContent.includes('테니스')) category = '테니스';
      else if (postContent.includes('다이어트') || postContent.includes('식단'))
        category = '다이어트';
      else if (postContent.includes('운동복') || postContent.includes('코디'))
        category = '운동복';
      else if (postContent.includes('프로틴') || postContent.includes('단백질'))
        category = '프로틴';
      else if (postContent.includes('수영') || postContent.includes('오수완'))
        category = '수영';
      else if (postContent.includes('필라테스')) category = '필라테스';
      else if (postContent.includes('바디프로필')) category = '바디프로필';
      else if (postContent.includes('스트레칭')) category = '스트레칭';
      else if (postContent.includes('라이딩') || postContent.includes('자전거'))
        category = '라이딩';
      else if (postContent.includes('클라이밍')) category = '클라이밍';
      else if (postContent.includes('트레드밀')) category = '트레드밀';

      for (let i = 0; i < commentCount; i++) {
        if (potentialCommenters.length === 0) break;

        // 댓글 작성자 랜덤 선택
        const commenterUuid =
          potentialCommenters[
            Math.floor(Math.random() * potentialCommenters.length)
          ];
        const commenterId = userUuidToIdMap[commenterUuid];
        const postId = postUuidToIdMap[post.id];

        // ID 매핑이 실패한 경우 건너뛰기
        if (!commenterId || !postId) {
          this.logger.warn(
            `ID 매핑 실패: commenterUuid=${commenterUuid}, postUuid=${post.id}`,
          );
          continue;
        }

        // 댓글 내용 선택 (카테고리별 40%, 일반 격려 30%, 질문 30%)
        let commentContent: string;
        const rand = Math.random();

        if (rand < 0.4 && commentTemplates[category]) {
          // 카테고리별 전문 댓글
          const categoryComments = commentTemplates[category];
          commentContent =
            categoryComments[
              Math.floor(Math.random() * categoryComments.length)
            ];
        } else if (rand < 0.7) {
          // 일반 격려 댓글
          commentContent =
            generalComments[Math.floor(Math.random() * generalComments.length)];
        } else {
          // 질문형 댓글
          commentContent =
            questionComments[
              Math.floor(Math.random() * questionComments.length)
            ];
        }

        // 댓글 생성 시간 (게시글 생성 시간 이후 7일 이내)
        const commentDate = new Date(post.createdAt);
        commentDate.setTime(
          commentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
        );

        comments.push({
          userUuid: commenterUuid,
          userId: commenterId,
          postId: postId,
          content: commentContent,
          createdAt: commentDate,
          updatedAt: commentDate,
        });
      }
    }

    // 댓글들을 시간순으로 정렬
    comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // 댓글 저장
    for (const commentData of comments) {
      try {
        const comment = commentRepository.create(commentData);
        await commentRepository.save(comment);

        this.logger.info(
          `댓글 생성 완료 (작성자: ${commentData.userUuid.slice(-8)}, 게시글 ID: ${commentData.postId})`,
        );
      } catch (error) {
        this.logger.error(`댓글 저장 중 오류 발생: ${error.message}`);
      }
    }

    this.logger.info(`총 ${comments.length}개의 댓글이 생성되었습니다.`);
  }
}
