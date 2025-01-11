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

// ... (이전 코드는 동일)

(async () => {
    try {
        console.log('카테고리별 피드 가져오기 시작...');
        
        for (const [categoryName, categoryPath] of Object.entries(CATEGORIES)) {
            try {
                console.log(`${categoryName} 카테고리 URL:`, `https://zo0oz.tistory.com${categoryPath}/rss`);
                
                const feed = await parser.parseURL(`https://zo0oz.tistory.com${categoryPath}/rss`);
                console.log(`${categoryName} 피드 데이터:`, feed?.items?.length || 0, '개의 포스트 발견');
                
                if (feed?.items?.length) {
                    text += `\n### ${categoryName}\n`;
                    
                    const numPosts = Math.min(5, feed.items.length);
                    for (let i = 0; i < numPosts; i++) {
                        const {title, link, pubDate, description} = feed.items[i];
                        console.log(`포스트 ${i + 1}:`, title);
                        const date = new Date(pubDate).toLocaleDateString('ko-KR');
                        
                        text += `<details>
<summary><b><a href='${link}' target='_blank'>${title}</a></b> (${date})</summary>

${truncateDescription(description)}

</details>\n\n`;
                    }
                }
            } catch (categoryError) {
                console.error(`${categoryName} 카테고리 처리 중 에러:`, categoryError);
                // 카테고리 에러가 발생해도 계속 진행
                continue;
            }
        }
        
        try {
            console.log('전체 RSS 피드 가져오기 시작...');
            const mainFeed = await parser.parseURL('https://zo0oz.tistory.com/rss');
            console.log('전체 피드 데이터:', mainFeed?.items?.length || 0, '개의 포스트 발견');
            
            if (mainFeed?.items?.length) {
                text += `\n### 최신 글\n`;
                const numPosts = Math.min(5, mainFeed.items.length);
                for (let i = 0; i < numPosts; i++) {
                    const {title, link, pubDate, description} = mainFeed.items[i];
                    console.log(`최신 글 ${i + 1}:`, title);
                    const date = new Date(pubDate).toLocaleDateString('ko-KR');
                    
                    text += `<details>
<summary><b><a href='${link}' target='_blank'>${title}</a></b> (${date})</summary>

${truncateDescription(description)}

</details>\n\n`;
                }
            }
        } catch (mainFeedError) {
            console.error('전체 피드 가져오기 중 에러:', mainFeedError);
        }
        
        console.log('README.md 파일 작성 시작...');
        writeFileSync('README.md', text, 'utf8');
        console.log('README.md 파일 생성 완료');
        console.log('생성된 텍스트:', text);
        
    } catch (error) {
        console.error('전체 프로세스 에러:', error);
        // 에러가 발생해도 기본 README는 생성
        writeFileSync('README.md', text, 'utf8');
    }
})();