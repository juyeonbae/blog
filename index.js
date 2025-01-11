import { writeFileSync } from 'node:fs';
import Parser from "rss-parser";

let text = `# Hi there 👋

## 이런 환경에 익숙해요✍🏼

## 언어

<p>
  <img alt="" src= "https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=JavaScript&logoColor=white"/> 
  <img alt="" src= "https://img.shields.io/badge/TypeScript-black?logo=typescript&logoColor=blue"/>
</p>

## 📕 Latest Blog Posts

`;

const parser = new Parser({
    headers: {
        Accept: 'application/rss+xml, application/xml, text/xml; q=0.1',
    }
});

(async () => {
    try {
        console.log('RSS 피드 가져오기 시작...');
        
        const feed = await parser.parseURL('https://devpad.tistory.com/rss');
        console.log('RSS 피드 가져오기 성공');
        console.log('피드 아이템 수:', feed.items?.length);
        
        if (!feed?.items?.length) {
            console.error('피드 아이템이 없습니다');
            // 피드가 없어도 기본 README는 생성
            writeFileSync('README.md', text, 'utf8');
            return;
        }

        text += `<ul>`;
        
        const numPosts = Math.min(10, feed.items.length);
        for (let i = 0; i < numPosts; i++) {
            const {title, link} = feed.items[i];
            console.log(`${i + 1}번째 게시물: ${title} - ${link}`);
            text += `<li><a href='${link}' target='_blank'>${title}</a></li>`;
        }

        text += `</ul>`;
        
        console.log('README.md 파일 작성 시작...');
        writeFileSync('README.md', text, 'utf8');
        console.log('README.md 파일 생성 완료');
        
        // 생성된 파일 내용 확인
        console.log('생성된 README.md 내용:');
        console.log(text);
        
    } catch (error) {
        console.error('에러 발생:', error);
        // 에러가 발생해도 기본 README는 생성
        writeFileSync('README.md', text, 'utf8');
    }
})();