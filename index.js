import { writeFileSync } from 'node:fs';
import Parser from "rss-parser";

let text = `# Hi there 👋

### 언어

<p>
    <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=Python&logoColor=white" alt="Python"/>
</p>

## 📕 Latest Blog Posts\n`;

const parser = new Parser({
    headers: {
        Accept: 'application/rss+xml, application/xml, text/xml; q=0.1',
    },
    customFields: {
        item: [
            ['content:encoded', 'content'],  // 전체 컨텐츠
            ['description', 'description']   // 요약
        ]
    }
});

function truncateDescription(description, maxLength = 200) {
    // HTML 태그 제거
    const plainText = description.replace(/<[^>]+>/g, '');
    // 특수문자 처리
    const cleanText = plainText.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // 길이 제한
    if (cleanText.length > maxLength) {
        return cleanText.substring(0, maxLength) + '...';
    }
    return cleanText;
}

const CATEGORIES = {
    'Algorithm': '/category/%F0%9F%9A%A9%20Coding%20Test',
    // 여기에 더 많은 카테고리 추가 가능
};

(async () => {
    try {
        console.log('카테고리별 피드 가져오기 시작...');
        
        for (const [categoryName, categoryPath] of Object.entries(CATEGORIES)) {
            console.log(`${categoryName} 카테고리 처리 중...`);
            
            const feed = await parser.parseURL(`https://zo0oz.tistory.com${categoryPath}/rss`);
            
            if (feed?.items?.length) {
                text += `\n### ${categoryName}\n`;
                
                // 각 카테고리별로 최신 5개 포스트만 가져옴
                const numPosts = Math.min(5, feed.items.length);
                for (let i = 0; i < numPosts; i++) {
                    const {title, link, pubDate, description} = feed.items[i];
                    const date = new Date(pubDate).toLocaleDateString('ko-KR');
                    
                    text += `<details>
<summary><b><a href='${link}' target='_blank'>${title}</a></b> (${date})</summary>

${truncateDescription(description)}

</details>\n\n`;
                }
            }
        }
        
        // 전체 최신 글 가져오기
        const mainFeed = await parser.parseURL('https://zo0oz.tistory.com/rss');
        if (mainFeed?.items?.length) {
            text += `\n### 최신 글\n`;
            const numPosts = Math.min(5, mainFeed.items.length);
            for (let i = 0; i < numPosts; i++) {
                const {title, link, pubDate, description} = mainFeed.items[i];
                const date = new Date(pubDate).toLocaleDateString('ko-KR');
                
                text += `<details>
<summary><b><a href='${link}' target='_blank'>${title}</a></b> (${date})</summary>

${truncateDescription(description)}

</details>\n\n`;
            }
        }
        
        console.log('README.md 파일 작성 시작...');
        writeFileSync('README.md', text, 'utf8');
        console.log('README.md 파일 생성 완료');
        
    } catch (error) {
        console.error('에러 발생:', error);
        // 에러가 발생해도 기본 README는 생성
        writeFileSync('README.md', text, 'utf8');
    }
})();