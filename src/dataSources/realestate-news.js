// src/dataSources/realestate-news.js
// 楼市资讯数据源 - 综合房地产新闻
import { getRandomUserAgent, sleep, isDateWithinLastDays, stripHtml, formatDateToChineseWithTime, escapeHtml } from '../helpers.js';

const RealEstateNewsDataSource = {
    type: 'realestate-news',
    
    /**
     * 从 Folo API 抓取楼市资讯数据
     */
    async fetch(env, foloCookie) {
        const listId = env.REALESTATE_NEWS_LIST_ID;
        const fetchPages = parseInt(env.REALESTATE_NEWS_FETCH_PAGES || '2', 10);
        const filterDays = parseInt(env.FOLO_FILTER_DAYS || '1', 10);
        const allItems = [];

        if (!listId) {
            console.warn('REALESTATE_NEWS_LIST_ID is not set in environment variables. Skipping real estate news fetch.');
            return {
                version: "https://jsonfeed.org/version/1.1",
                title: "楼市资讯",
                description: "房地产行业综合新闻",
                language: "zh-cn",
                items: []
            };
        }

        let publishedAfter = null;
        for (let i = 0; i < fetchPages; i++) {
            const userAgent = getRandomUserAgent();
            const headers = {
                'User-Agent': userAgent,
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'accept-language': 'zh-CN,zh;q=0.9',
                'origin': 'https://app.follow.is',
                'x-app-name': 'Folo Web',
                'x-app-version': '0.4.9',
            };

            if (foloCookie) {
                headers['Cookie'] = foloCookie;
            }

            const body = {
                listId: listId,
                view: 1,
                withContent: true,
            };

            if (publishedAfter) {
                body.publishedAfter = publishedAfter;
            }

            try {
                console.log(`Fetching Real Estate News, page ${i + 1}...`);
                const response = await fetch(env.FOLO_DATA_API, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    console.error(`Failed to fetch Real Estate News, page ${i + 1}: ${response.statusText}`);
                    break;
                }

                const data = await response.json();
                if (data && data.data && data.data.length > 0) {
                    const filteredItems = data.data.filter(
                        entry => isDateWithinLastDays(entry.entries.publishedAt, filterDays)
                    );
                    
                    allItems.push(...filteredItems.map(entry => ({
                        id: entry.entries.id,
                        url: entry.entries.url,
                        title: entry.entries.title,
                        content_html: entry.entries.content,
                        date_published: entry.entries.publishedAt,
                        authors: [{ name: entry.entries.author || entry.feeds.title }],
                        source: entry.feeds.title,
                        feed_url: entry.feeds.url,
                    })));
                    
                    publishedAfter = data.data[data.data.length - 1].entries.publishedAt;
                } else {
                    console.log(`No more data for Real Estate News, page ${i + 1}.`);
                    break;
                }
            } catch (error) {
                console.error(`Error fetching Real Estate News, page ${i + 1}:`, error);
                break;
            }

            await sleep(Math.random() * 3000 + 1000);
        }

        return {
            version: "https://jsonfeed.org/version/1.1",
            title: "楼市资讯",
            description: "房地产行业综合新闻",
            language: "zh-cn",
            items: allItems
        };
    },

    /**
     * 将原始数据转换为统一格式
     */
    transform(rawData, sourceType) {
        if (!rawData || !rawData.items) {
            return [];
        }

        return rawData.items.map(item => ({
            id: item.id,
            type: sourceType,
            url: item.url,
            title: item.title,
            description: stripHtml(item.content_html || '').substring(0, 500),
            published_date: item.date_published,
            authors: item.authors ? item.authors.map(author => author.name).join(', ') : '未知来源',
            source: item.source || '楼市资讯',
            details: {
                content_html: item.content_html || '',
                feed_url: item.feed_url || ''
            }
        }));
    },

    /**
     * 生成展示用 HTML
     */
    generateHtml(item) {
        return `
            <strong>🏠 ${escapeHtml(item.title)}</strong><br>
            <small>来源: ${escapeHtml(item.source)} | 发布时间: ${formatDateToChineseWithTime(item.published_date)}</small>
            <div class="content-html">${item.details.content_html || '暂无详细内容'}</div>
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">阅读原文 →</a>
        `;
    }
};

export default RealEstateNewsDataSource;

