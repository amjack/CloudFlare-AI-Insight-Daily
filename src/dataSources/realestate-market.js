// src/dataSources/realestate-market.js
// 楼市市场数据源 - 房价、成交、土地市场数据
import { getRandomUserAgent, sleep, isDateWithinLastDays, stripHtml, formatDateToChineseWithTime, escapeHtml } from '../helpers.js';

const RealEstateMarketDataSource = {
    type: 'realestate-market',
    
    /**
     * 从 Folo API 抓取楼市市场数据
     */
    async fetch(env, foloCookie) {
        const listId = env.REALESTATE_MARKET_LIST_ID;
        const fetchPages = parseInt(env.REALESTATE_MARKET_FETCH_PAGES || '1', 10);
        const filterDays = parseInt(env.FOLO_FILTER_DAYS || '1', 10);
        const allItems = [];

        if (!listId) {
            console.warn('REALESTATE_MARKET_LIST_ID is not set. Skipping market data fetch.');
            return {
                version: "https://jsonfeed.org/version/1.1",
                title: "市场数据",
                description: "房地产市场行情数据",
                language: "zh-cn",
                items: []
            };
        }

        let publishedAfter = null;
        for (let i = 0; i < fetchPages; i++) {
            const headers = {
                'User-Agent': getRandomUserAgent(),
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'origin': 'https://app.follow.is',
                'x-app-name': 'Folo Web',
            };

            if (foloCookie) {
                headers['Cookie'] = foloCookie;
            }

            const body = {
                listId: listId,
                view: 1,
                withContent: true,
                ...(publishedAfter && { publishedAfter })
            };

            try {
                console.log(`Fetching Real Estate Market Data, page ${i + 1}...`);
                const response = await fetch(env.FOLO_DATA_API, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    console.error(`Failed to fetch Market data, page ${i + 1}: ${response.statusText}`);
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
                    })));
                    
                    publishedAfter = data.data[data.data.length - 1].entries.publishedAt;
                } else {
                    break;
                }
            } catch (error) {
                console.error(`Error fetching Market data, page ${i + 1}:`, error);
                break;
            }

            await sleep(Math.random() * 3000 + 1000);
        }

        return {
            version: "https://jsonfeed.org/version/1.1",
            title: "市场数据",
            description: "房地产市场行情数据",
            language: "zh-cn",
            items: allItems
        };
    },

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
            source: item.source || '市场数据',
            details: {
                content_html: item.content_html || ''
            }
        }));
    },

    generateHtml(item) {
        return `
            <strong>📊 ${escapeHtml(item.title)}</strong><br>
            <small>来源: ${escapeHtml(item.source)} | 发布时间: ${formatDateToChineseWithTime(item.published_date)}</small>
            <div class="content-html">${item.details.content_html || '暂无详细内容'}</div>
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">查看详细数据 →</a>
        `;
    }
};

export default RealEstateMarketDataSource;

