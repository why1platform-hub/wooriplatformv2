-- Fix: Add YouTube video URLs to courses that were seeded with empty URLs
-- Run this in Supabase Dashboard → SQL Editor if you already ran migration_v3

UPDATE courses SET
  video_url = 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  lessons = '[{"id":"mock-2-1","title":"AI란 무엇인가?","duration":"12:00","video_url":"https://www.youtube.com/watch?v=jNQXAC9IVRw"},{"id":"mock-2-2","title":"ChatGPT 실전 활용법","duration":"14:20","video_url":"https://www.youtube.com/watch?v=kJQP7kiw5Fk"},{"id":"mock-2-3","title":"AI로 업무 효율 높이기","duration":"12:00","video_url":"https://www.youtube.com/watch?v=RgKAFK5djSk"}]'::jsonb
WHERE id = 'mock-2';

UPDATE courses SET
  video_url = 'https://www.youtube.com/watch?v=9bZkp7q19f0',
  lessons = '[{"id":"mock-3-1","title":"부동산 시장 분석 기초","duration":"18:00","video_url":"https://www.youtube.com/watch?v=9bZkp7q19f0"},{"id":"mock-3-2","title":"수익형 부동산 투자 전략","duration":"17:10","video_url":"https://www.youtube.com/watch?v=JGwWNGJdvx8"},{"id":"mock-3-3","title":"부동산 세금과 법률 상식","duration":"17:00","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]'::jsonb
WHERE id = 'mock-3';

UPDATE courses SET
  video_url = 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  lessons = '[{"id":"mock-4-1","title":"창업 아이디어 발굴법","duration":"14:00","video_url":"https://www.youtube.com/watch?v=kJQP7kiw5Fk"},{"id":"mock-4-2","title":"사업계획서 작성 가이드","duration":"15:30","video_url":"https://www.youtube.com/watch?v=RgKAFK5djSk"},{"id":"mock-4-3","title":"자금 조달과 투자 유치","duration":"12:00","video_url":"https://www.youtube.com/watch?v=JGwWNGJdvx8"}]'::jsonb
WHERE id = 'mock-4';

UPDATE courses SET
  video_url = 'https://www.youtube.com/watch?v=RgKAFK5djSk',
  lessons = '[{"id":"mock-5-1","title":"은퇴 자금 얼마나 필요할까?","duration":"12:00","video_url":"https://www.youtube.com/watch?v=RgKAFK5djSk"},{"id":"mock-5-2","title":"연금과 보험 최적화","duration":"12:45","video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"},{"id":"mock-5-3","title":"투자 포트폴리오 구성","duration":"11:00","video_url":"https://www.youtube.com/watch?v=jNQXAC9IVRw"}]'::jsonb
WHERE id = 'mock-5';

UPDATE courses SET
  video_url = 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
  lessons = '[{"id":"mock-6-1","title":"사회공헌 활동의 종류와 시작","duration":"15:00","video_url":"https://www.youtube.com/watch?v=JGwWNGJdvx8"},{"id":"mock-6-2","title":"재능기부와 멘토링 참여하기","duration":"13:15","video_url":"https://www.youtube.com/watch?v=9bZkp7q19f0"}]'::jsonb
WHERE id = 'mock-6';
